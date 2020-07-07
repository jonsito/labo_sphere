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
<h3 style="text-align:center">Acceso al puesto de laboratorio <?php echo $host; ?> <br/>mediante t&uacute;nel SSH/VNC</h3>
<h3>Informaci&oacute;n adicional</h3>
<ol>
    <li>Direcci&oacute;n IP origen: <?php echo $_SERVER['REMOTE_ADDR']  ?></li>
    <li>Equipo al que se conecta: <?php echo $fqdn; ?></li>
    <li>Hora de inicio de la sesi&oacute;n: <?php echo date('Y-M-d H:i')?></li>
    <li>Duraci&oacute;n de la sesi&oacuten: <span id="duration_counter"><?php echo $duration ?></span></li>
</ol>
<h3>Instrucciones para el uso del t&uacute;nel</h3>
<dl>
    <dt><strong>Acceso mediante conexi&oacute;n segura (SSH) </strong></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Acceso mediante escritorio remoto (VNC)</strong></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Acceso mediante cliente NX (X2Go)</strong></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Cierre de la sesi&oacute;n</strong></dt>
    <dd>
        Para cerrar la sesión debe acceder a la pantalla de acceso remoto y:
        <ol>
            <li>Seleccionar el equipo en el que se ha abierto sesión (actualmente <strong><?php echo $host; ?></strong>)</li>
            <li>Seleccionar "Acceso mediante t&uacute;nel"</li>
            <li>Seleccionar "Cerrar sesi&oacute;n</li>
        </ol>
        <img src="/labo_sphere/web/images/cierre_sesion.png" alt="cierre sesion" width="320" height="320">
    </dd>
</dl>
</body>
</html>