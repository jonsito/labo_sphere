<?php
require_once(__DIR__."/../server/tools.php");
require_once(__DIR__."/../server/objects/AuthLDAP.php");
$user=http_request("username","s","_invalid_");
$pass=http_request("password","s","_invalid_");
$auth=new AuthLDAP();
$res=false;
// if defined DEBUG_USER and matches, jump directly into page
if (($user===DEBUG_USER) && (DEBUG_USER!=="")) $res=true;
if ($res===false) {
    // not valid yet else check credentials in ldap
    $res=$auth->login($user,$pass);
    // finally check if user is in admins ACL list
    if ($res===true) if (strpos(ADMIN_USERS,$user)===FALSE) $res=false;
}
// on not authorized, show screen and return
if($res==false) { readfile(__DIR__."/../denied.html"); exit(0); }
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>CdC Labo Sphere</title>
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/libs/jquery-easyui-1.9.5/themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/libs/jquery-easyui-1.9.5/themes/icon.css">
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/libs/jquery-easyui-1.9.5/demo/demo.css">
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/css/style.css">
    <script type="text/javascript" src="/labo_sphere/web/libs/jquery-easyui-1.9.5/jquery.min.js"></script>
    <script type="text/javascript" src="/labo_sphere/web/libs/jquery-easyui-1.9.5/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="/labo_sphere/web/libs/easyui-patches.js"></script>
    <script type="text/javascript" src="/labo_sphere/web/libs/polling.js"></script>
    <script type="text/javascript" src="/labo_sphere/web/libs/actions.js"></script>
</head>
<body onload="pollNodes();">
<img src="images/cdcTitle.png" alt="cdc logo header" style="width:900px">
<input type="hidden" id="poll_running" value="0"/>
<h2>Administraci&oacute;n de equipos del laboratorio</h2>
<div style="margin:20px 0;"></div>
<div class="easyui-tabs" data-options="tabWidth:100,tabHeight:80" style="width:900px;height:640px">
    <div title="<span class='tt-inner'><img src='/labo_sphere/web/images/clients.png'/><br>Clients</span>" style="padding:5px">
        <table id="labo_treegrid" style="width:100%;height:550px">
            <thead>
                <tr>
                    <th data-options="field:'name',width:'30%',align:'left'">Nombre</th>
                    <th data-options="field:'level',hidden:'true'"></th>
                    <th data-options="field:'ip',width:'20%',align:'center'">IP Addr</th>
                    <th data-options="field:'status',width:'7%',align:'center',styler:statusStyler">Estado</th>
                    <th data-options="field:'server',width:'15%',align:'center'">Servidor</th>
                    <th data-options="field:'users',width:'28%'">Usuarios</th>
                </tr>
            </thead>
        </table>
    </div>
    <div title="<span class='tt-inner'><img src='/labo_sphere/web/images/servers.png'/><br>Servers</span>" style="padding:10px">
        <p>
            <?php include_once(__DIR__."./map.php");?>
        </p>
    </div>
    <div title="<span class='tt-inner'><img src='/labo_sphere/web/images/config.png'/><br>Config</span>" style="padding:10px">
        <p>A personal digital assistant (PDA), also known as a palmtop computer, or personal data assistant, is a mobile device that functions as a personal information manager. PDAs are largely considered obsolete with the widespread adoption of smartphones.</p>
    </div>
    <div title="<span class='tt-inner'><img src='/labo_sphere/web/images/tools.png'/><br>Tools</span>" style="padding:10px">
        <p>A tablet computer, or simply tablet, is a one-piece mobile computer. Devices typically have a touchscreen, with finger or stylus gestures replacing the conventional computer mouse.</p>
    </div>
</div>
<!-- BARRA DE TAREAS DEL ARBOL DE MAQUINAS-->
<div id="labo_treegrid_toolbar">
    <span style="float:left;padding:5px">
        <strong>Despliegue de equipos</strong>
    </span>
	<span style="float:right;padding:5px">
		<a id="labo-startBtn" href="#" class="easyui-linkbutton"  data-options="iconCls:'icon-start'"
           onclick="labo_action('start');">Start</a>
   		<a id="labo-stopBtn" href="#" class="easyui-linkbutton"  data-options="iconCls:'icon-stop'"
           onclick="labo_action('stop');">Stop</a>
   		<a id="labo-statusBtn" href="#" class="easyui-linkbutton" data-options="iconCls:'icon-info'"
           onclick="labo_action('status')">Status</a>
   		<a id="labo-consoleBtn" href="#" class="easyui-linkbutton" data-options="iconCls:'icon-console'"
           onClick="labo_action('console');">SSH Console</a>
   	</span>
</div>

<script type="text/javascript">

    $('#labo_treegrid').treegrid( {
        toolbar: '#labo_treegrid_toolbar',
        method: 'get',
        url: '/labo_sphere/web/ajax/viewFunctions.php?Operation=clients',
        rownumbers: false,
        idField: 'id',
        treeField: 'name',
        onBeforeLoad: function() { enablePolling("0"); return true; },
        onLoadSuccess: function(row,data) {
            // populate name tables by adding root node to data to allow recursive iteration
            populateTree( { 'id':0,'name':'rootNode', 'children':data } );
            // start polling
            enablePolling("1");
            return true;
        },
        onBeforeSelect: function(row) { return (parseInt(row.level) > 1); }
    });
</script>
</body>
</html>