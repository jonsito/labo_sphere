<?php
require_once(__DIR__ . "/../../server/tools.php");
$host=http_request("host","s","");
$user=http_request("user","s","");
if($host==="") { readfile(__DIR__ . "/../denied.html"); exit(0); }
$server=gethostname();
$url="wss://{$server}.lab.dit.upm.es:6001/{$host}.lab.dit.upm.es:22";
?>
<html lang="es">
<head>
    <title>Lab-DIT SSH Web access to host: <?php echo "$host"?> </title>
    <meta charset="utf-8">
	<script type="text/javascript"> var wsproxyURL = '<?php echo $url; ?>'; </script>
	<link rel="stylesheet" href="/labo_sphere/web/SSHy/css/xterm.css" async/>
	<script type="text/javascript" src="/labo_sphere/web/SSHy/js/combinedJS.comb.js" async></script>
    <script type="text/javascript">
        function wrapper_auth(){
            if(typeof transport == 'undefined'){
                setTimeout(wrapper_auth, 150);
            } else {
                transport.auth.termUsername = '<?php echo $user; ?>';
                term.write("\n\r" + transport.auth.termUsername + '@<?php echo "$host"?>\'s password:');
                transport.auth.termPassword = '';
            }
        }
        wrapper_auth();
    </script>
</head>
<body>
	<div id="terminal"></div>
</body>
</html>
