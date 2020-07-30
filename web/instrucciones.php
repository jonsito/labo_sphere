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

<dl>
    <dt>
        <strong>Consideraciones iniciales</strong>
    </dt>
    <dd>
        <br/>
        Es necesario el uso de un navegador actualizado: Firefox, Chrome, Safari, Edge.
                La aplicaci&oacute;n web no funciona con Explorer o versiones antiguas de Android
    </dd>
    <dd>
        <br/>
        El alumno debe estar dado de alta ( tener cuenta ) en el laboratorio.
        En el caso de alumnos de cursos anteriores, la cuenta deber&aacute; esta renovada<br/>
        Para darse de alta, renovar la cuenta, o restaurar la contrase&ntilde;a, acceder al siguiente <a href="https://wwww.lab.dit.upm.es/labng">enlace</a>
    </dd>
    <dd>
        <br/>
        Al finalizar la sesi&oacute;n el alumno <strong>NO DEBE</strong> apagar el ordenador en el que se ha trabajado,
        sino simplemente cerrar la sesi&oacute;n
    </dd>
    <dd>
        <br/>
        La creaci&oacute;n de m&aacute;quinas virtuales bajo demanda no est&aacute; disponible todav&iacute;a.
        Las pr&aacute;cticas que requiren el uso de m&aacute;quinas virtuales deber&aacute;n realizarse abriendo sesi&oacute;n en equipos
        f&iacute;sicos ( no virtuales ) del laboratorio
    </dd>
    <dd>
        <br/>
        El acceso a equipos Mac-OSX est&aacute; reservado a los alumnos de las asignaturas relacionadas,
        y no se puede realizar el acceso a dichos equipos con la cuenta normal del laboratorio
        <br/>&nbsp;<br/>
    </dd>
    <dt><strong>Apertura de sesi&oacute;n</strong></dt>
    <dd>
        <br/>
        Para iniciar sesi&oacute;n remota accederemos a la p&aacute;gina <a href="https://acceso.lab.dit.upm.es">https://acceso.lab.dit.upm.es</a>
    </dd>
    <dd>
        <br/>
        Algunos navegadores no reconocen correctamente el certificado, debido a que no incluyen en su configuraci&oacute;n
        la autoridad de certificaci&oacute;n (CA) que se utiliza en la UPM. <br/>
        En este caso deberemos pulsar donde indica "Avanzado" y seleccionar "ir al sitio web"
    </dd>
    <dd>
        <br/>
        En la pantalla que se nos muestra deberemos indicar:
        <ul>
            <li>Nombre de usuario (<strong>SIN</strong> @lab.dit.upm.es ) y contraseña del laboratorio</li>
            <li>Equipo al que se desea acceder:<br/>
                <ul>
                    <li>Equipos del edificio A-127 (Para alumnos de primeros cursos)</li>
                    <li>Equipos del edificio B-123 (Para alumnos de &uacute;ltimos cursos)</li>
                    <li>Equipos virtuales (Para prácticas sencillas que no requieran virtualizaci&oacute;n)</li>
                    <li>Equipos Mac-OSX (Para alumnos que cursan asignaturas que requieren OSX)</li>
                    <li>Alternativamente se puede seleccionar un equipo concreto, para por ejemplo continuar una
                    pr&aacute;ctica anterior que usa datos en disco local
                    </li>
                </ul>
            </li>
            <li>
                Duraci&oacute;n de la sesi&oacute;n ( entre 1 y 6 horas )
            </li>
        </ul>
    </dd>
    <dd>
        <br/>
        Al pulsar <em>"Aceptar"</em> se comprueban las credenciales y el sistema busca un equipo libre en el laboratorio.<br/>
        Si no hay ning&uacute;n equipo encendido libre, el sistema proceder&aacute; a encender un nuevo equipo.
        En este caso se le indicar&aacute; al alumno que debe esperar un minuto a que la m&aacute;quina est&eacute; disponible
    </dd>
    <dd>
        <br/>
        Una vez asignado equipo, en la ventana de la derecha se indicar&aacute;
        <ul>
            <li>La IP del alumno desde la que se realiza la conexi&oacute;n</li>
            <li>El equipo asignado en el laboratorio</li>
            <li>El comienzo y duraci&oacute;n de la sesi&oacute;n</li>
            <li>El tiempo restante</li>
            <li>Un bot&oacute;n adicional para solicitar el cierre de la sesi&oacute;n</li>
            <li>Dos botones para el acceso al sistema desde el navegador (aplicaci&oacute;n web)
                <ul>
                    <li>Acceso en modo gr&aacute;fico mediante escritorio remoto (VNC)</li>
                    <li>Acceso al equipo en modo texto mediante conexi&oacute;n segura (SSH)</li>
                </ul>
            </li>
        </ul>
        <br/>
    </dd>
    <dt><strong>Conexiones mediante interfaz web</strong></dt>
    <dd>
        <br/>
        Una vez realizada la conexi&oacute;n puede acceder directamente al equipo seleccionado
        usando el navegador ( Firefox, Chrome, Safari o Edge )<br/>&nbsp;<br/>
        Para ello utilice los botones correspondientes en la ventana de informaci&oacute;n de la sesi&oacute;n
        <br/>La acci&oacute;n seleccionada abrir&aacute; una nueva ventana, por lo que deberá habilitar el permitir
        desplegar ventanas emergentes para esta p&aacute;gina<br/>&nbsp;<br/>
    </dd>
    <dt><strong>Acceso mediante conexi&oacute;n segura en modo texto (SSH) </strong></dt>
    <dd>
        <br/>
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
    <dt><strong>Acceso mediante escritorio remoto (VNC)</strong></dt>
    <dd>
        <br/>
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
    <dt><strong>Acceso mediante cliente NX (X2Go)</strong></dt>
    <dd>
        <br/>
        ( pending )
        <br/>&nbsp;<br/>
    </dd>
    <dt><strong>Cierre de la sesi&oacute;n</strong></dt>
    <dd>
        <br/>
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