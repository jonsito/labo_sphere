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
        type: 'POST',
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
                if ( (action==='console') && (result.data!=="") ) {
                    let url='SSHy/SSHy.php?'+result.data;
                    window.open(
                        url,
                        node.name,
                        "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
                                 "location=0, directories=no, width=800, height=600, left=400, top=300"
                    );
                } else if (action==='status') {
                    console.log('Pending: show returned status')
                } else {
                    $.messager.alert("Success","Requested action '"+action+"' <br/>sent to server","info");
                }
            }
        }
    }).always(function(){
        $.messager.progress('close');
    });
}

function labo_session(mode,tipo) {
    function fireupConsole(host) {
        let url='web/SSHy/SSHy.php?hmode=1&host='+host+'&umode=1&user='+$('#username').val();
        window.open(
            url,
            "ssh@"+host,
            "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
            "location=0, directories=no, width=800, height=600, left=400, top=300"
        );
    }

    function fireupDesktop(host) {
        $.messager.alert("VPN@"+host,"El escritorio remoto no esta disponible todavía","error");
    }
    function fireupTunel(host) {
        $.messager.alert("Tunel@"+host,"El acceso mediante túnel no está disponible todavía","error");
    }

    $.messager.progress({ title:'Processing',text:"Iniciando sesion de tipo '"+tipo+"'"});
    $.ajax({
        type: 'POST',
        url:'web/ajax/actionFunctions.php',
        data: {
            Operation:'fireup',
            username:$('#username').val(),
            password:$('#password').val(),
            name:mode,
            tipo:tipo
        },
        dataType: 'json',
        success: function (result) {
            if (result.hasOwnProperty('errorMsg')) {
                $.messager.show({width: 300, height: 200, title: 'Error', msg: result.errorMsg});
            } else {
                let host=result.data
                switch(tipo) {
                    case "desktop" : setTimeout(function() {fireupDesktop(host);},0); return;
                    case "console" : setTimeout(function() {fireupConsole(host);},0); return;
                    case "tunel" :  setTimeout(function() {fireupTunel(host);},0); return;
                }
            }
        }
    }).always(function(){
        $.messager.progress('close');
    });
}