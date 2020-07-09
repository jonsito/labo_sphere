<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","-");
$fqdn=http_request("fqdn","s","-");
$duration=http_request("duration","s","-"); // valor textual del combobox
$fecha=($host==="-")?"":date('Y-M-d H:i');
$connected=($host==="-")?"No se ha establecido conexi&oacute;n":"Conexi&oacute;n activa";
$disabled=($host==="-")?'disabled="disabled"':'';
?>

<h3 style="text-align:center">Acceso al puesto de laboratorio <?php echo $host; ?></h3>
<p> <em><?php echo $connected; ?> </em></p>
<ul>
    <li>Direcci&oacute;n IP origen: <?php echo $_SERVER['REMOTE_ADDR']  ?></li>
    <li>Equipo al que se conecta: <?php echo $fqdn; ?></li>
    <li>Hora de inicio de la sesi&oacute;n: <?php echo $fecha?></li>
    <li>Duraci&oacute;n de la sesi&oacuten: <span id="duration_counter"><?php echo $duration ?></span></li>
</ul>
<p style="text-align:center">
    <br/>&nbsp;</br>
    Tiempo restante (hh:mm) : <span id="time_remaining">00:00</span><br/>&nbsp;<br/>
    <input type="button" value="Cerrar sesi&oacute;n" <?php echo $disabled;?> onclick="close_sesion('<?php echo $host;?>')"/>
</p>