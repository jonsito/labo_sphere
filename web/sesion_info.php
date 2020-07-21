<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","-");
$fqdn=http_request("fqdn","s","-");
$duration=http_request("duration","s","-"); // texto del combobox
$countdown=http_request("countdown","i","0"); // valor del combobox
$fecha=($countdown===0)?"":date('Y-M-d H:i');
$connected=($countdown===0)?"Conexi&oacute;n inactiva":"Conexi&oacute;n activada";
$disabled=($countdown===0)?'none':'inline-block';
if($countdown===0) $duration="-"
?>

<h3 style="text-align:center">Acceso al puesto de laboratorio <?php echo $host; ?></h3>
<p> <em><?php echo $connected; ?> </em></p>
<ul>
    <li>Direcci&oacute;n IP origen: <em><?php echo $_SERVER['REMOTE_ADDR']  ?></em></li>
    <li>Equipo al que se conecta: <em><?php echo $fqdn; ?></em></li>
    <li>Hora de inicio de la sesi&oacute;n: <em> <?php echo $fecha?></em></li>
    <li>Duraci&oacute;n de la sesi&oacute;n: <em><span id="duration_counter"><?php echo $duration ?></span></em></li>
</ul>
<table id="session_buttons" style="padding-left:10px;table-layout:auto;width:100%;display:<?php echo $disabled;?>">
    <tr>
        <td colspan="2" style="text-align:center">
            Tiempo restante: <span id="time_remaining">00:00:00</span>&nbsp;
            <button type="button" id="button_close" onclick="button_sesion('<?php echo $host;?>','tunel')">Cerrar sesi&oacute;n</button>
            <br/>&nbsp;<br/>
        </td>
    </tr>
    <tr>
        <td style="width:50%;text-align:center;">
            <button type="button" id="button_desktop" onclick="button_sesion('<?php echo $host;?>','desktop')">
                <strong>Escritorio remoto</strong><br/>
                <img id="icon_desktop" src="web/images/desktop.png" alt="desktop">
            </button>
            &nbsp;
        </td>
        <td style="width:50%;text-align:center;">
            &nbsp;
            <button type="button" id="button_terminal" onclick="button_sesion('<?php echo $host;?>','console')">
                <strong>Terminal de texto</strong><br/>
                <img id="icon_terminal" src="web/images/terminal.png" alt="terminal">
            </button>
        </td>
    </tr>
    <tr>
        <td colspan="2" style="text-align:center">
            Consultar instrucciones para informaci&oacute;n adicional
        </td>
    </tr>
</table>
<script type="text/javascript">
    var cd="<?php echo $countdown;?>"; // countdown is seconds
    $('#time_remaining').html(cd.toHHMMSS(true));
    var end=Date.now()+1000*cd; // datenow is milis
    var shownmsg=false;
    var counter=setInterval( function() {
        let now=Date.now(); // seconds
        let remaining=Math.floor( ( end - Date.now()) / 1000);
        if (remaining<0) {
            remaining=0;
            clearInterval(counter);
            // PENDING: close session without showing accept/cancel button, just notify
            // setTimeout(function() {button_sesion('<?php echo $host;?>','tunel');},0);
        }
        if ((remaining<300) && (remaining>200)) {
            let msg="La sesi&oacute;n se cerrar&aacute;a en breves minutos<br/>";
            msg+="Puede renovarla indicando un nuevo intervalo y pulsando 'Acceder'";
            if (!shownmsg) $.messager.alert("Aviso",msg,"info");
            shownmsg=true;
        }
        $('#time_remaining').html(remaining.toString().toHHMMSS(true));
    },1000); // call update time every 30 seconds

    addTooltip($('#button_close'),'Terminar la sesi&oacute;n<br/>Cerrar todas las conexiones abiertas')
    addTooltip($('#button_desktop'),'Seleccione "Escritorio remoto" <br/>para desplegar el entorno gráfico<br/> tal y como se vería en el puesto\n' +
        '            del laboratorio');
    addTooltip($('#button_terminal'),'Seleccione "Terminal de texto" <br/>para desplegar una sesión en modo consola (solo texto)')
</script>