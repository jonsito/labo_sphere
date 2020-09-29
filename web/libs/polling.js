
var pending_nodes=Array(0,0,0,0); /* vm servers, pcs, extra, servers */
var haveWebsockets=false;
var nodes=null;
var nodeListByName=[];

// iterate recursively node tree to index elements by name
// data is an object array, that contains id,name children
function populateTree(data) {
    for (let n=0; n<data.length;n++) {
        if (data[n].children.length!==0) populateTree(data[n].children);
    }
    if (data.name!=='rootNode') {
        console.log("adding node:'"+ data.name + "' id:"+data.id);
        nodeListByName[data.name]=data.id;
    }
}

function enableWebSockets() {

    function findTreeNodeByName(name) {
        if (typeof(nodeListByName[name])==='undefined') return -1;
        return nodeListByName[name];
    }

    // abrimos web socket
    let socket = new WebSocket("wss://acceso.lab.dit.upm.es:6002","imalive");
    if (socket) haveWebsockets=true;

    socket.onopen = function(e) {
        console.log("[open] Connection established");
    };

    // received data is in json format
    socket.onmessage = function(event) {
        console.log(`[message] Data received from server: ${event.data}`);
        [ host,state,server,users ]= event.data.split(":");
        // buscamos el node ID que tiene el nombre recibido
        id=findTreeNodeByName(host);
        if (id<=0) return;
        let tg=$('#labo_treegrid');
        row=tg.treegrid('find',id);
        if (row==null) return;
        // update row data
        var st=parseInt(data.state);
        if (st<0) row.state='???';
        if (st===0) row.state='Off';
        if (st>0) row.state="On";
        if (users!=='-') row.state="Busy";
        row.server=server;
        row.users=users;
        // and refresh gui
        tg.treegrid('refresh',id);
    };

    socket.onclose = function(event) {
        if (event.wasClean) {
            $.messager.alert("info",`[ws close] Connection closed cleanly, code=${event.code} reason=${event.reason}`,"info");
        } else {
            // e.g. server process killed or network down
            // event.code is usually 1006 in this case
            $.messager.alert("error",`[ws close] Connection died,  code=${event.code} reason=${event.reason}`,"error");
        }
    };

    socket.onerror = function(error) {
        $.messager.alert("error",`[ws error] code=${error.code} reason=${error.reason}`,"error");
    };
}

function updateTree(data,parentid){
    var tg=$('#labo_treegrid');
    for(n=0;n<data.length;n++) {
        var item=data[n];
        if (item.status==="Old") { // remove node
            tg.treegrid('remove',item.id);
            // setTimeout(function() {tg.treegrid('reload',parentid);},0);
        } else if (item.status==="New") { // create node an insert into parent
            tg.treegrid('append',{'node':parentid,'data':item});
            // setTimeout(function() {tg.treegrid('reload',parentid);},0);
        } else { // update node
            tg.treegrid('update',{'id':item.id,'row':item});
            // setTimeout(function() {tg.treegrid('refresh',item.id);},0);
        }
    }
}


/**
 * llamada a comprobar el estado de un grupo de servidores. puede estar vacio,
 * en cuyo caso hay que verificar si es un servidor o un grupo vacio
 * @param node selected treenode node
 */
function checkNode(node) {
    // if node is about Linux clients, do nothing: use websockets for push refresh
    const hasntPolling=Array("Lab. B-123-1","Lab. B-123-2","Lab. A-127-4","Lab. A-127-3","Lab. A-127-2","Despachos y Acc. Remoto" );
    if (hasntPolling.includes(node.name) && (haveWebsockets===true) ) return; // just do nothing.

    // else use poll refresh
    if(typeof(pending_nodes[node.id])=="undefined") pending_nodes[node.id]=0; // initialize if not yet
    if (pending_nodes[node.id]!==0) return; // still busy do nothing
    // retrieve and compose children list
    var hosts=node.children;
    if (node.name)
    // split host list in groups of 10 hosts
    var i,j,temparray,chunk = 5;
    for (i=0,j=hosts.length; i<j; i+=chunk) {
        pending_nodes[node.id]++;
        temparray = hosts.slice(i,i+chunk);

        var hostList="BEGIN";
        temparray.forEach(function(item) { hostList = hostList+","+item.id+":"+item.name+":"+item.status; });
        hostList=hostList+",END";
        // call server to retrieve status
        $.ajax({
            type: 'GET',
            url:'ajax/viewFunctions.php',
            data: {
                Operation:'checkgroup',
                id:node.id,
                name:node.name,
                children:hostList /* id:name comma separated list. may be empty */
            },
            dataType: 'json',
            success: function (result) {
                if (result.hasOwnProperty('errorMsg')) {
                    $.messager.show({width: 300, height: 200, title: 'Error', msg: result.errorMsg});
                } else {// on submit success, reload results
                    setTimeout(function() {updateTree(result.data,node.id);},0);
                }
            }
        }).always(function(){ pending_nodes[node.id]--; });
    }
}

function pollNodes() {
    if (haveWebsockets===false) enableWebSockets(); // try to open websocket. on fail retry at next loop iteration
    if($('#poll_running').val()==="1") {
        var roots=$('#labo_treegrid').treegrid('getRoots');
        roots.forEach(function(node,index,parent) {
            var children=node['children'];
            children.forEach(checkNode);
        });
    }
    setTimeout(pollNodes,30000); // 30 seconds
}

function enablePolling(val) { $('#poll_running').val(val); }