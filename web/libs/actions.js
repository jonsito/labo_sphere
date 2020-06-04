function labo_action(action) {
    // comprobamos la seleccion
    var tg=$('#labo_treegrid');
    var node=tg.treegrid('getSelected');
    if (!node) {
        $.messager.alert("Error","No host/group selected","error");
        return false;
    }
    var msg="";
    switch (action) {
        case 'start': msg="Starting node "+node.name; break;
        case 'stop': msg="Stopping node "+node.name; break;
        case 'status': msg="Retrieve node status: "+node.name; break;
        case 'console': msg="Launch SSH console on node "+node.name; break;
    }
    if (msg==="") {
        $.messager.alert("Error","Unknown action selected on node "+node.name,"error");
        return false;
    }
    // PENDING: on level 2 must choose between server/group action
    // this is done in server by mean of change level to 1:server or 2:group

    // retrieve parent node data
    parent=tg.treegrid('getParent',node.id);
    // now perform ajax call
    $.messager.progress({ title:'Processing',text:msg});
    $.ajax({
        type: 'GET',
        url:'ajax/actionFunctions.php',
        data: {
            Operation:action,
            id:node.id,
            name:node.name,
            parent:parent.name,
            level:node.level,
        },
        dataType: 'json',
        success: function (result) {
            if (result.hasOwnProperty('errorMsg')) {
                $.messager.show({width: 300, height: 200, title: 'Error', msg: result.errorMsg});
            } else {
                // on success check action to open when needed additional windows
                if (action==='console') {
                } else if (action==='status') {
                } else {
                    $.messager.alert("Success","Requested action '"+action+"' <br/>sent to server","info");
                }
            }
        }
    }).always(function(){ $.messager.progress('close'); });
}