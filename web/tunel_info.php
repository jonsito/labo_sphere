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
<h4>Informaci&oacute;n adicional</h4>
<ol>
    <li>Direcci&oacute;n IP origen: <?php echo $_SERVER['REMOTE_ADDR']  ?></li>
    <li>Direcci&oacute:n IP destino: <?php echo $fqdn; ?></li>
    <li>Hora de inicio de la sesi&oacute;n: <?php echo date('Y-M-d H:i:s')?></li>
    <li>Duraci&oacute;n de la sesi&oacuten: <span id="duration_counter"><?php echo $duration ?></span></li>
</ol>
<h4>Instrucciones para el uso del t&uacute;nel</h4>
( pending )
</body>
</html>