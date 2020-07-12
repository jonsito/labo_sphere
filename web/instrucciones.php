<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","-");
$user=http_request("username","s","-");
$fqdn=http_request("fqdn","s","-");
$countdown=http_request("countdown","i","0"); // valor del combobox
$disabled=($countdown===0)?'disabled="disabled"':'';
if ($user==="-") $user="&lt;username&gt;";
if ($host==="-") $host="&lt;host&gt;";
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Lab-DIT SSH/VPN Tunel</title>
</head>
<body>
<dl>
    <dt><strong>Conexiones mediante interfaz web</strong><br/>&nbsp;<br/></dt>
    <dd>
        Una vez realizada la conexi&oacute;n puede acceder directamente al equipo seleccionado
        usando el navegador ( Firefox, Chrome, Safari o Edge )<br/>&nbsp;<br/>
        <table style="width:100%">
            <tr>
                <td style="width:180px">
                    <button type="button" <?php echo $disabled; ?> onclick="button_sesion('<?php echo $host;?>','desktop')">
                        <strong>Escritorio remoto</strong><br/>
                        <img id="icon_desktop" src="web/images/desktop.png" alt="desktop">
                    </button>
                </td>
                <td colspan="2" style="padding:10px">
                    Seleccione "Escritorio remoto" para desplegar el entorno gráfico tal y como se vería en el puesto
                    del laboratorio
                </td>
                <td style="width:180px">
                    <button type="button" <?php echo $disabled; ?> onclick="button_sesion('<?php echo $host;?>','console')">
                        <strong>Terminal de texto</strong><br/>
                        <img id="icon_terminal" src="web/images/terminal.png" alt="terminal">
                    </button>
                </td>
                <td colspan="2" style="padding:10px">
                    Seleccione "Terminal de texto" para desplegar una sesión en modo consola (solo texto)
                </td>
            </tr>
        </table>
        <br/>La acci&oacute;n seleccionada abrir&aacute; una nueva ventana, por lo que deberá habilitar el permitir
        desplegar ventanas emergentes para esta p&aacute;gina<br/>&nbsp;<br/>
    </dd>
    <dt><strong>Acceso mediante conexi&oacute;n segura en modo texto (SSH) </strong><br/>&nbsp;<br/></dt>
    <dd>
        Para acceder en modo texto al ordenador seleccionado, una vez iniciada la sesi&oacute;n
        basta con conectarse al ordenador elegido utilizando un cliente de SSH. Por ejemplo desde Linux/Mac:
        <br/>&nbsp;<br/>
        <span style="border:solid 1px; margin:5px; padding:5px; font-family:Courier New, Courier, monospace">
            ssh <?php echo $host; ?>.lab.dit.upm.es -l <?php echo $user; ?>
        </span>
        <br/>&nbsp;<br/>
        Desde Windows se puede utilizar cualquier cliente de SSH, por ejemplo PuTTY,
        creando una sesión contra la máquina <?php echo $host; ?>.lab.dit.upm.es.<br/>
        Las &uacute;ltimas versiones de windows 10 incluyen un cliente OpenSSH con lo que se puede
        utilizar el modo texto como desde Linux/Mac<br/>&nbsp;<br/>
    </dd>
    <dt><strong>Acceso mediante escritorio remoto (VNC)</strong><br/>&nbsp;<br/></dt>
    <dd>
        Si no desea utilizar el escritorio remoto web y desea utilizar uno propio (p.e: Remina, TightVnc, RealVNC, etc ),
        &eacute;ste deberá ser instalado en su equipo local. El Cliente de Acceso Remoto (rdesktop) que viene de serie con Windows no
        es válido, pues utliza un protocolo distinto ( RDP en lugar de RFB )
        <br/>&nbsp;<br/>
        Para conectarse al laboratorio, una vez abierta la sesión, deberá utilizar como dirección de acceso,
        la indicada en la ventana de conexión. (p.e: l133.lab.dit.upm.es ) y el puerto 5900/TCP.
        <br/>
        Es recomendable que el cliente soporte encriptación SSL
        <br/>&nbsp;<br/>
        Una vez abierto el cliente VNC aparecerá la pantalla de login/contraseña del equipo como si se estuviera frente
        a la consola.
        <br/>
        Ejemplo desde Linux:
        <br/>&nbsp;<br/>
        <span style="border:solid 1px; margin:5px; padding: 5px; font-family:Courier New,Courier, monospace">
            vncviewer <?php echo $host; ?>.lab.dit.upm.es:5900
        </span>
        <br/>&nbsp;<br/>
        Para acceder desde un Mac-OSX no es necesario instalar servidor VNC adicional: se puede usar el servidor que
        el navegador Safari trae de serie, abriendo la dirección: <em>vnc://<?php echo $host; ?>.lab.dit.upm.es:5900</em>
        <br/>&nbsp;<br/>
    </dd>
    <dt><strong>Acceso mediante cliente NX (X2Go)</strong><br/>&nbsp;<br/></dt>
    <dd>
        ( pending )
        <br/>&nbsp;<br/>
    </dd>
    <dt><strong>Cierre de la sesi&oacute;n</strong><br/>&nbsp;<br/></dt>
    <dd>
        Para cerrar la sesión debe acceder a la pantalla de acceso remoto basta con pulsar "Cerrar Sesi&oacute;n"
        en la ventana de "Datos de conexi&oacute;n"<br/>
        Si lo que queremos es cerrar una sesión abierta anteriormente y que no está presente en pantalla, lo deberemos
        hacer de forma manual:
        <ol>
            <li>Seleccionar el equipo en el que se ha abierto sesión (actualmente <strong><?php echo $host; ?></strong>)</li>
            <li>En el campo "Duraci&oacute;n" indicar "Cerrar sesi&oacute;n"</li>
            <li>Pulsar en acceder</li>
        </ol>
        <br/>
        <img src="/labo_sphere/web/images/cierre_sesion.png" alt="cierre sesion" width="320" height="320"
             style="margin:5px; padding:5px; border:solid 1px">
    </dd>
</dl>
</body>
</html>