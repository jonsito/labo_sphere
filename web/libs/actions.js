function delayAction(message,delay,callback) {
    var count=parseInt(delay);
    var win = $.messager.progress({
        title: message,
        msg: 'Please wait <span id="timeout_delay">'+delay+'</span> seconds to make sure<br/> that client is up and running',
        interval: 1000,
        text:'Waiting...',
        top: 100
    });
    var interval=setInterval(function(){$('#timeout_delay').html(count.toString());count--;},990)
    setTimeout(function(){
        clearInterval(interval);
        $.messager.progress('close');
        if (typeof(callback)==="function" ) callback();
    },parseInt(delay)*1000)
}

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
                    let url='SSHy/SSHy.php?delay=0&'+result.data;
                    admin_console = window.open(
                        url,
                        node.name,
                        "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
                                 "location=0, directories=no, width=780, height=445, left=400, top=300"
                    );
                    setTimeout(function() {admin_console.focus();},300);
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

function labo_session(mode,tipo,duration) {
    function fireupConsole(host,delay) {
        let url='web/SSHy/SSHy.php?delay='+delay+'&hmode=1&host='+host+'.lab.dit.upm.es&umode=1&username='+username;
        window_console = window.open(
            url,
            "ssh@"+host,
            "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
            "location=0, directories=no, width=780, height=445, left=400, top=300"
        );
        setTimeout(function() {window_console.focus();},300);
    }

    function fireupDesktop(host,port,delay) {
        function openVNC(host,port) {
            let fromport=6100+parseInt(host.replace("l",""));
            let url="web/noVNC/vnc.php?encrypt=1&host=acceso.lab.dit.upm.es&port="+fromport;
            url+="&path="+host+".lab.dit.upm.es";
            url+="&resize=scale&show_dot=true&autoconnect=true"
            window_desktop = window.open(
                url,
                "vnc@"+host,
                "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
                "location=0, directories=no, width=1440, height=900, left=400, top=300"
            );
            setTimeout(function() {window_desktop.focus();},300);
        }

        if (delay===0) {
            openVNC(host,port);
        } else {
            delayAction('Starting VNC Desktop on host: '+'<?php echo $host;?>', delay,function() {openVNC(host,port);} );
        }
    }

    function fireupTunel(host,port,delay) {
        function openTunel(host) {
            let dr=$('#duration');
            let ls=$('#labo_sphere-layout');
            let params = "?host="+host;
            params +="&port="+port;
            params +="&fqdn="+host+".lab.dit.upm.es";
            params +="&duration="+dr.combobox('getText');
            params +="&countdown="+dr.combobox('getValue');
            params +="&username="+$('#username').textbox('getValue');
            // recargamos panel de estado de conexion para mostrar nuevo estado
            ls.layout('panel','east').panel('refresh','web/sesion_info.php'+params);
            // recargamos panel de instrucciones para activar botones de escritorio y consola
            $('#labo_sphere-tabs').tabs('getTab','Instrucciones').panel('refresh','web/instrucciones.php'+params);
            // actualzamos datos de conexion
            $("#family_host").prop("checked", true);
            selectFamily('host');
            $('#sesion_host').textbox('setValue',host);
            // on open connection just return
            if (parseInt(dr.combobox('getValue'))!==0) return;
            // on close connection, also close child windows
            if ( (window_desktop!=null) && (window_desktop.closed===false) ) window_desktop.close();
            if ( (window_console!=null) && (window_console.closed===false) ) window_console.close();
            window_desktop=null;
            window_console=null;
        }

        if (delay===0) {
            openTunel(host);
        } else {
            msg='Closing tunel connection with host: '
            if (duration!==0) msg='Starting ssh/vnc tunel to host: '
            delayAction(msg +'<?php echo $host;?>', delay,function() {openTunel(host);} );
        }
    }

    var host=$('#sesion_host').textbox('getValue');
    var username=$('#username').textbox('getValue');
    var password=$('#password').passwordbox('getValue');
    var msg="Iniciando sesi&oacute;n";
    if (tipo !== 'tunel') {
        msg += " de tipo '"+tipo+"'";
        msg += "<br/>Por favor, verifique que su navegador tiene desbloqueada";
        msg += "<br/> la apertura de ventanas emergentes para esta web";
    } else {
        if (parseInt(duration)===0) msg="Cerrando sesi&oacute;n con host: '" + host + "'";
    }
    $.messager.progress({ title:'Processing',text:msg});
    if (host==="") host="none";
    $.ajax({
        type: 'POST',
        url:'web/ajax/actionFunctions.php',
        data: {
            Operation: 'fireup',
            username: username,
            password: password,
            duration: duration,
            name: mode,
            tipo: tipo,
            host: host
        },
        dataType: 'json',
        success: function (result) {
            if (result.hasOwnProperty('errorMsg')) {
                $.messager.show({width: 300, height: 200, title: 'Error', msg: result.errorMsg});
            } else {
                let host=result.host;
                let port=result.port;
                let delay=result.delay;
                switch(tipo) {
                    // in new main page: tunel is allways set,
                    // so no delay is required in further invocation of "desktop" or console
                    case "desktop" : setTimeout(function() {fireupDesktop(host,port,0);},0); return;
                    case "console" : setTimeout(function() {fireupConsole(host,0);},0); return;
                    case "tunel" :  setTimeout(function() {fireupTunel(host,port,delay);},0); return;
                }
            }
        }
    }).always(function(){
        $.messager.progress('close');
    });
}