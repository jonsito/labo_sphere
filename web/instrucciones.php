<?php
require_once(__DIR__ . "/../server/tools.php");
$host=http_request("host","s","-");
$fqdn=http_request("fqdn","s","-");
$disabled=($host==="-")?'disabled="disabled"':'';
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
        mediante el uso del navegador ( Firefox, Chrome, Safari o Edge )<br/>&nbsp;<br/>
        <table style="width:100%">
            <tr>
                <td style="width:180px">
                    <button <?php echo $disabled; ?> onclick="acceder('desktop')">
                        <strong>Escritorio remoto</strong><br/>
                        <img id="icon_desktop" src="web/images/desktop.png" alt="desktop">
                    </button>
                </td>
                <td colspan="2" style="padding:10px">
                    Seleccione "Escritorio remoto" para desplegar el entorno gráfico tal y como se vería en el puesto
                    del laboratorio
                </td>
                <td style="width:180px">
                    <button <?php echo $disabled; ?> onclick="acceder('console')">
                        <strong>Terminal de texto</strong><br/>
                        <img id="icon_terminal" src="web/images/terminal.png" alt="terminal">
                    </button>
                </td>
                <td colspan="2" style="padding:10px">
                    Seleccione "Terminal de texto" para desplegar una sesión en modo consola (solo texto)
                </td>
            </tr>
        </table>
        <br/>&nbsp<br/>
    </dd>
    <dt><strong>Acceso mediante conexi&oacute;n segura (SSH) </strong><br/>&nbsp;<br/></dt>
    <dd>
        Para acceder en modo texto al ordenador seleccionado, una vez iniciada la sesi&oacute;n
        basta con conectarse al ordenador elegido utilizando un cliente de SSH. Por ejemplo desde Linux/Mac:
        <pre>
        ssh &lt;ordenador&gt;.lab.dit.upm.es -l &lt;usuario&gt;
        </pre>
        Desde Windows se puede utilizar cualquier cliente de SSH, por ejemplo PuTTY,
        creando una sesión contra la máquina &lt;ordenador&gt;.lab.dit.upm.es.<br/>
        Las &uacute;ltimas versiones de windows 10 incluyen un cliente OpenSSH con lo que se puede
        utilizar el modo texto como desde Linux/Mac<br/>&nbsp;<br/>
    </dd>
    <dt><strong>Acceso mediante escritorio remoto (VNC)</strong><br/>&nbsp;<br/></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Acceso mediante cliente NX (X2Go)</strong><br/></dt>
    <dd>
        ( pending )
    </dd>
    <dt><strong>Cierre de la sesi&oacute;n</strong><br/></dt>
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
        <img src="/labo_sphere/web/images/cierre_sesion.png" alt="cierre sesion" width="320" height="320" style="border:solid 1px">
    </dd>
</dl>
</body>
</html>