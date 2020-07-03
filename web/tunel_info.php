<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h3 style="text-align:center">Acceso al puesto de laboratorio <?php echo $host; ?> <br/>mediante t&uacute;nel SSH/VNC</h3>
<h4>Informaci&oacute;n adicional</h4>
</body>
</html>