<?php
require_once(__DIR__ . "/../../server/tools.php");
$host=http_request("host","s","");
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h2>Acceso al puesto de laboratorio<?php echo $host; ?> mediante t&uacute;nel SSH/VNC</h2>
<h3>Informaci&oacute;n adicional</h3>
</body>
</html>