<?php
require_once(__DIR__."/../server/tools.php");
$host=http_request("host","s","");
if($host==="") { readfile(__DIR__."/../denied.html"); exit(0); }
$server=gethostname();
$url="wss://{$server}:6001/{$host}:22";
?>
<html lang="es">
<head>
    <title>Lab-DIT SSH Web access to host: <?php echo "$host"?> </title>
    <meta charset="utf-8">
	<script type="text/javascript">
		var wsproxyURL = <?php echo $url; ?>
	</script>
	<link rel="stylesheet" href="css/xterm.css" async/>
	<script type="text/javascript" src="js/combinedJS.comb.js" async></script>
</head>
<body>
	<div id="terminal"></div>
</body>
</html>
