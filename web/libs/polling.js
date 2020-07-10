// convert seconds to hh:mm[:ss]
String.prototype.toHHMMSS = function (showsecs) {
    var sec_num = parseInt(this, 10); // don't forget the second parm
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }
    var time = hours + ':' + minutes;
    if (showsecs) time += ':' + seconds;
    return time;
}

function updateTree(data,parentid){
    var tg=$('#labo_treegrid');
    for(n=0;n<data.length;n++) {
        var item=data[n];
        if (item.status==="Old") { // remove node
            tg.treegrid('remove',node.id);
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

var pending_nodes=Array(0,0,0,0); /* vm servers, pcs, extra, servers */
/**
 * llamada a comprobar el estado de un grupo de servidores. puede estar vacio,
 * en cuyo caso hay que verificar si es un servidor o un grupo vacio
 * @param node selected treenode node
 */
function checkNode(node) {
    if(typeof(pending_nodes[node.id])=="undefined") pending_nodes[node.id]=0; // initialize if not yet
    if (pending_nodes[node.id]!==0) return; // still busy do nothing
    // retrieve and compose children list
    var hosts=node.children;

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