function delayAction(message,delay,callback) {
    var count=parseInt(delay);
    var win = $.messager.progress({
        title: message,
        msg: 'Please wait <span id="timeout_delelay">'+delay+'</span> seconds to make sure<br/> that client is up and running',
        interval: 1000,
        text:'Waiting...',
        top: 100
    });
    var interval=setInterval(function(){$('#timeout_delay').html(count.toString());cont --;},1000)
    setTimeout(function(){
        cleartInterval(interval);
        if (typeof(callback)==="function" ) callback();
        $.messager.progress('close');
    },delay*1000)
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
                    let w=window.open(
                        url,
                        node.name,
                        "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
                                 "location=0, directories=no, width=800, height=600, left=400, top=300"
                    );
                    setTimeout(function() {w.focus();},300);
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
    function fireupConsole(host,delay) {
        let url='web/SSHy/SSHy.php?delay='+delay+'&hmode=1&host='+host+'.lab.dit.upm.es&umode=1&username='+$('#username').val();
        let w=window.open(
            url,
            "ssh@"+host,
            "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
            "location=0, directories=no, width=800, height=600, left=400, top=300"
        );
        setTimeout(function() {w.focus();},300);
    }

    function openVNC(host,port) {
        let fromport=6100+parseInt(host.replace("l",""));
        let url="web/noVNC/vnc.php?encrypt=1&host=acceso.lab.dit.upm.es&port="+fromport;
        // url += "&password="+$('#password').val();
        let w=window.open(
            url,
            "vnc@"+host,
            "resizable=no, toolbar=no, scrollbars=no, menubar=no, status=no,"+
            "location=0, directories=no, width=1440, height=900, left=400, top=300"
        );
        setTimeout(function() {w.focus();},300);
    }

    function fireupDesktop(host,port,delay) {
        if (delay===0) {
            openVNC(host,port);
            return;
        }
        delayAction(
            'Starting VNC Desktop on host: '+'<?php echo $host;?>',
            delay,
            function() {openVNC(host,port);}
            );
    }

    function fireupTunel(host,port,delay) {
        $.messager.alert("Tunel@"+host,"El acceso mediante túnel no está disponible todavía","error");
    }

    $.messager.progress({ title:'Processing',text:"Iniciando sesion de tipo '"+tipo+"'"});
    var host=$('#sesion_host').textbox('getValue');
    if (host==="") host="none";
    $.ajax({
        type: 'POST',
        url:'web/ajax/actionFunctions.php',
        data: {
            Operation:'fireup',
            username:$('#username').val(),
            password:$('#password').val(),
            name:mode,
            tipo:tipo,
            host:host
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
                    case "desktop" : setTimeout(function() {fireupDesktop(host,port,delay);},0); return;
                    case "console" : setTimeout(function() {fireupConsole(host,delay);},0); return;
                    case "tunel" :  setTimeout(function() {fireupTunel(host,port,delay);},0); return;
                }
            }
        }
    }).always(function(){
        $.messager.progress('close');
    });
}