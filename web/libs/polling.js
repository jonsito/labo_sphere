
var pending_nodes=Array(0,0,0,0); /* vm servers, pcs, extra, servers */
var haveWebsockets=false;
var nodes=null;
var nodeListByName=[];

// iterate recursively node tree to index elements by name
// data is an array of objects, that contains id,name,children[]
function populateTree(data) {
    for (let n=0;n<data.children.length;n++) {
        populateTree(data.children[n]);
    }
    console.log("adding node:'"+ data.name + "' id:"+data.id);
    nodeListByName[data.name]=data.id;
}

function findTreeNodeByName(name) {
    if (typeof(nodeListByName[name])==='undefined') return -1;
    return nodeListByName[name];
}

function getToolTip(name) {
    if (typeof(nodeListByName[name])==='undefined') return "";
    let id=nodeListByName[name];
    if (id<0) return "";
    row=$('#labo_treegrid').treegrid('find',id);
    msg=     "Host:   "+name+
        "<br/>Model:  "+row.model+
        "<br/>Status: "+row.status+
        "<br/>Uptime: "+row.uptime+
        "<br/>Server: "+row.server+
        "<br/>Load:   "+row.load+
        "<br/>Memory: "+row.meminfo+
        "<br/>Users:  "+row.users;
    return msg;
}

function fireActionFromMap(action) {
    // vemos a qué pc corresponde
    let host=$('#current_host').html();
    let id=findTreeNodeByName(host);
    if (id<0) { console.log("invalid host name selected: "+host); return 0; }
    // en función de la acción solicitada llamamos a las rutinas correspondientes
    let tg=$('#labo_treegrid');
    tg.treegrid('select',id);
    labo_action(action);
}

function handleGlobalScores(state,servers,users) {
    let st=state.split('/');
    $('#global_state').val("On:"+st[0]+" Off:"+st[1]+" Busy:"+st[2]+" Unknown:"+st[3]+" Total:"+st[4]);
    let srv=servers.split('/');
    $('#global_servers').val("Bin1:"+srv[0]+" Bin2:"+srv[1]+" Bin3:"+srv[2]+" Bin4:"+srv[3]+" Macs:"+srv[4]);
    let usr=users.split('/');
    $('#global_users').val("Users:"+usr[0]+" Load:"+usr[1]+"%");
}

function handleWSData(data) {
    // dividimos el mensaje en trozos separados por '\n'
    let a=data.split('\n');
    for (let n=0;n<a.length;n++) {
        if (a[n]==="") continue; // empty, at end of data
        // analizamos cada data individual
        [ host,state,server,users,load,meminfo,model ]= a[n].split(":");
        // buscamos el node ID que tiene el nombre recibido
        if(host==='l000') {
            handleGlobalScores(state,server,users);
            continue;
        }
        id=findTreeNodeByName(host);
        if (id<=0) continue;
        let tg=$('#labo_treegrid');
        row=tg.treegrid('find',id);
        if (row==null) continue;
        // update row data
        var st=parseInt(state);
        if (st<0) { row.status='???'; row.uptime=""; }
        if (st===0) { row.status='Off'; row.uptime=""; }
        if (st>0) {
            row.status="On";
            days = parseInt(st/(60*60*24));
            hours = parseInt((st/(60*60)))%24;
            minutes = parseInt(st/60)%60;
            seconds = parseInt(st)%60;
            row.uptime=""+days+" days "+hours+":"+minutes+":"+seconds;
        }
        if ( (users!=='-') && (users!=='') ) row.status="Busy";
        row.server=server;
        row.users=users;
        row.load=load;
        row.meminfo=meminfo;
        row.model=model;
        // and refresh gui
        tg.treegrid('refresh',id); // treegrid
        css=statusStyler(row.status,null,null).split(':'); // background-color:#XXXXX
        $('#img_'+host).css(css[0],css[1]);
    }
}

function enableWebSockets() {

    // abrimos web socket
    let socket = new WebSocket("wss://acceso.lab.dit.upm.es:6002","imalive");
    if (socket) haveWebsockets=true;

    socket.onopen = function(e) {
        console.log("[open] Connection established");
    };

    // received data is in json format
    socket.onmessage = function(event) {
        // console.log(`[message] Data received from server: ${event.data}`);
        handleWSData(event.data);
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
    const hasntPolling=Array("Lab. B-123-1","Lab. B-123-2","Lab. A-127-4","Lab. A-127-3","Lab. A-127-2","MACs A-127-4","Despachos y Acc. Remoto" );
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