
var pending_nodes=Array(0,0,0,0); /* vm servers, pcs, extra, servers */

/**
 * llamada a comprobar el estado de un grupo de servidores. puede estar vacio,
 * en cuyo caso hay que verificar si es un servidor o un grupo vacio
 * @param node selected treenode node
 */
function checkNode(node) {
    if(typeof(pending_nodes[node.id])=="undefined") pending_nodes[node.id]=0; // initialize if not yet
    if (pending_nodes[node.id]!==0) return; // still busy do nothing
    pending_nodes[node.id]=1;
    // retrieve and compose children list
    var hosts=node.children;
    var hostList="BEGIN";
    hosts.forEach(function(item) { hostList = hostList+","+item.id+":"+item.name+":"+item.status; });
    hostList=hostList+",END";
    // call server to retrieve status
    $.ajax({
        type: 'GET',
        url:'../ajax/viewFunctions.php',
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
                console.log(result.data);
            }
        }
    }).always(function(){ pending_nodes[node.id]=0 });
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