<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","-");
$fqdn=http_request("fqdn","s","-");
$duration=http_request("duration","s","-"); // texto del combobox
$countdown=http_request("countdown","i","0"); // valor del combobox
$fecha=($countdown===0)?"":date('Y-M-d H:i');
$connected=($countdown===0)?"Conexi&oacute;n inactiva":"Conexi&oacute;n activada";
$disabled=($countdown===0)?'disabled="disabled"':'';
if($countdown===0) $duration="-"
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
    <button type="button" <?php echo $disabled;?> onclick="button_sesion('<?php echo $host;?>','tunel')">Cerrar sesi&oacute;n</button>
</p>
<script type="text/javascript">

    function timer() {
        let countdown=$('#countdown').val();
        if (parseInt(countdown)<=0) {
            countdown="0";
            clearInterval(counter);
        }
        $('#countdown').val( (parseInt(countdown)-60).toString());
        $('#time_remaining').html(countdown.toHHMMSS(false));
    }
    var cd='<?php echo $countdown; ?>';
    $('#countdown').val(cd);
    $('#time_remaining').html(cd.toHHMMSS(false));
    var counter=setInterval(timer,60000);

</script>