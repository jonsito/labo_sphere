<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","");
$fqdn=http_request("fqdn","s","");
$duration=http_request("duration","s","");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lab-DIT SSH/VPN Tunel</title>
</head>
<body>
<dl>
    <dt><strong>Conexiones mediante interfaz web</strong><br/>&nbsp;<br/></dt>
    <dd>
        Una vez realizada la conexi&oacute;n puede acceder directamente al equipo seleccionado
        mediante el uso del navegador ( Firefox, Chrome, Safari o Edge )
        <ol>
            <li> Seleccione "Escritorio remoto" para desplegar el entorno gráfico tal y como se vería en el puesto
            del laboratorio</li>
            <li> Seleccione "Terminal de texto" para desplegar una sesión en modo consola (solo texto)</li>
        </ol>
        <table>
            <th style="width:200px">
                <label for="tipo_desktop">Escritorio Remoto</label><br/>&nbsp;<br/>
                <img id="icon_desktop" src="web/images/desktop.png" alt="desktop">
            </th>
            <th style="width:200px">
                <label for="tipo_terminal">Terminal de texto</label><br/>&nbsp;<br/>
                <img id="icon_terminal" src="web/images/terminal.png" alt="terminal">
            </th>
        </table>
    </dd>
    <dt><strong>Acceso mediante conexi&oacute;n segura (SSH) </strong><br/></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Acceso mediante escritorio remoto (VNC)</strong><br/></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Acceso mediante cliente NX (X2Go)</strong><br/></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Cierre de la sesi&oacute;n</strong><br/></dt>
    <dd>
        Para cerrar la sesión debe acceder a la pantalla de acceso remoto:
        <ol>
            <li>Seleccionar el equipo en el que se ha abierto sesión (actualmente <strong><?php echo $host; ?></strong>)</li>
            <li>Seleccionar "Acceso mediante t&uacute;nel"</li>
            <li>Seleccionar "Cerrar sesi&oacute;n</li>
        </ol>
        <img src="/labo_sphere/web/images/cierre_sesion.png" alt="cierre sesion" width="320" height="320" style="border:solid 1px">
    </dd>
</dl>
</body>
</html>