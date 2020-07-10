<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","-");
$fqdn=http_request("fqdn","s","-");
$duration=http_request("duration","s","-"); // texto del combobox
$countdown=http_request("countdown","i","0"); // valor del combobox
$fecha=($host==="-")?"":date('Y-M-d H:i');
$connected=($host==="-")?"No se ha establecido conexi&oacute;n":"Conexi&oacute;n activa";
$disabled=($host==="-")?'disabled="disabled"':'';
?>

<h3 style="text-align:center">Acceso al puesto de laboratorio <?php echo $host; ?></h3>
<p> <em><?php echo $connected; ?> </em></p>
<ul>
    <li>Direcci&oacute;n IP origen: <em><?php echo $_SERVER['REMOTE_ADDR']  ?></em></li>
    <li>Equipo al que se conecta: <em><?php echo $fqdn; ?></em></li>
    <li>Hora de inicio de la sesi&oacute;n: <em> <?php echo $fecha?></em></li>
    <li>Duraci&oacute;n de la sesi&oacuten: <em><span id="duration_counter"><?php echo $duration ?></span></em></li>
</ul>
<p style="text-align:center">
    <br/>&nbsp;<br/>
    Tiempo restante (hh:mm) : <span id="time_remaining">00:00</span><br/>&nbsp;<br/>
    <button type="button" <?php echo $disabled;?> onclick="close_sesion('<?php echo $host;?>')">Cerrar sesi&oacute;n</button>
</p>
<script type="text/javascript">

    function set_countdown(duration) { // seconds
        if (duration<0) duration=0;
        let mins=parseInt(duration/60);
        var h = Math.floor(mins / 60);
        var m = mins % 60;
        h = h < 10 ? '0' + h : h;
        m = m < 10 ? '0' + m : m;
        $('#time_remaining').html(h + ':' + m);
        if (duration===0) return;
        setTimeout(function() {set_countdown(duration-60); },60000 ); // sleep 1 minute
    }

    setTimeout(function(){ set_countdown( <?php echo $countdown; ?>); },0);
</script>