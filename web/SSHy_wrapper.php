<?php
require_once(__DIR__."/../server/tools.php");
$host=http_request("host","s","");
$user=http_request("user","s","");
$pass=http_request("pass","s","");
if($host==="") { readfile(__DIR__."/../denied.html"); exit(0); }
$server=gethostname();
$url="wss://{$server}.lab.dit.upm.es:6001/{$host}.lab.dit.upm.es:22";
?>
<html lang="es">
<head>
    <title>Lab-DIT SSH Web access to host: <?php echo "$host"?> </title>
    <meta charset="utf-8">
	<script type="text/javascript">
        var wsproxyURL = '<?php echo $url; ?>';

        function wrapper_auth(){
            if(typeof transport == 'undefined'){
                setTimeout(wrapper_auth, 150);
            } else {
                transport.auth.termUsername = '<?php echo $user; ?>';
                term.write("\n\r" + transport.auth.termUsername + '@<?php echo "$host"?>\'s password:');
                transport.auth.termPassword = '';
            }
        }
        // var wsUserPass = '<?php echo $pass; ?>'; // very dangerous. Should load page with post instead get
    </script>
	<link rel="stylesheet" href="/labo_sphere/web/css/xterm.css" async/>
	<script type="text/javascript" src="/labo_sphere/web/libs/combinedJS.comb.js" async></script>
</head>
<body onload="wrapper_auth()">
	<div id="terminal"></div>
</body>
</html>
