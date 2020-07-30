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
        <div class="box">
            <span class="images">
                        <img id="labo_login"
                             src="/labo_sphere/web/images/labo_login.png" alt="labo_login"
                             onmousemove="zoomIn('labo_login',event)" onmouseout="zoomOut('labo_login')"/>
            </span>
            <span>
                En la pesta&ntilde;a marcada como <em>Configuraci&oacute;n</em> deberemos indicar:<br/>&nbsp;
                <ul>
                    <li>Nombre de usuario ( <strong>SIN</strong> <em>@lab.dit.upm.es</em> ) y contraseña del laboratorio</li>
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
                <br/>(Pase el cursor sobre la figura para agrandar la imagen)<br/>
            </span>
            <span class="preview" style="right:50px" id="labo_login_preview" onmouseover="zoomIn('labo_login',event)"></span>
        </div>
        <br/>&nbsp;
    </dd>
    <dd>
        Al pulsar <em>"Acceder"</em> se comprueban las credenciales y el sistema busca un equipo libre en el laboratorio.<br/>
        Si no hay ning&uacute;n equipo encendido libre, el sistema proceder&aacute; a encender un nuevo equipo.
        En este caso se le indicar&aacute; al alumno que debe esperar un minuto a que la m&aacute;quina est&eacute; disponible
    </dd>
    <dd>
        <div class="box" style="width:100%">
            <span class="preview" style="left:50px" id="labo_login_success_preview" onmouseover="zoomIn('labo_login_success',event)"></span>
            <span>
                Una vez asignado equipo, en la ventana de la derecha se indicar&aacute;<br/>&nbsp;
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
                <br/>(Pase el cursor sobre la figura para agrandar la imagen)<br/>
            </span>
            <span class="images">
                <img id="labo_login_success"  style="margin-left:150px;"
                    src="/labo_sphere/web/images/labo_login_success.png" alt="labo_login_sucess"
                    onmousemove="zoomIn('labo_login_success',event)" onmouseout="zoomOut('labo_login_success')"/>
            </span>
        </div>
    </dd>
    <dt><strong>Acceso mediante navegador a trav&eacute;s del interfaz web</strong></dt>
    <dd>
        <br/>
        Una vez realizada la conexi&oacute;n puede acceder directamente al equipo seleccionado
        usando el navegador ( Firefox, Chrome, Safari o Edge )<br/>&nbsp;<br/>
        Para ello utilice los botones correspondientes en la ventana de informaci&oacute;n de la sesi&oacute;n, seleccionando
        acceso en modo <em>gr&aacute;fico</em> o en modo <em>texto</em>
        <br/>&nbsp;<br/>
        La acci&oacute;n seleccionada abrir&aacute; una nueva ventana, por lo que deberá habilitar el permitir
        desplegar ventanas emergentes para esta p&aacute;gina
        <br/>&nbsp;<br/>
    </dd>
    <dd>
        Cinco minutos antes de finalizar la sesi&oacute;n se presentar&aacute; un mensaje de aviso.<br/>
        Al expirar el tiempo asignado las ventanas abiertas mediante interfaz web se cerrar&aacute;n autom&aacute;ticamente
        <br/>&nbsp<br/>
        Si el usuario desea continuar la sesi&oacute;n activa, debera solicitar un nuevo acceso,
        indicando esta vez acceso a la m&aacute;quina que le ha sido asignada en la sesi&oacute;n que va a expirar
        <br/>&nbsp;<br/>
    </dd>
    <dt><strong>Acceso desde el ordenador local mediante conexi&oacute;n segura en modo texto (SSH) </strong></dt>
    <dd>
        <br/>
        Para acceder en modo texto al ordenador seleccionado, una vez iniciada la sesi&oacute;n
        basta con conectarse al ordenador elegido utilizando un cliente de SSH. Por ejemplo desde Linux/Mac:
        <br/>&nbsp;<br/>
        <span class="codigo">
            ssh <?php echo $host; ?>.lab.dit.upm.es -l <?php echo $user; ?>
        </span>
        <br/>&nbsp;<br/>
            <div class="box">
                <span class="images">
                    <img id="putty_login"
                         src="/labo_sphere/web/images/putty_login.png" alt="putty_login"
                        onmousemove="zoomIn('putty_login',event)" onmouseout="zoomOut('putty_login')"/>
                </span>
                <span style="vertical-align: text-top">
                    <br/>&nbsp;<br/>
                    Desde Windows se puede utilizar cualquier cliente de SSH, por ejemplo PuTTY,
                    creando una sesión contra la máquina <?php echo $host; ?>.lab.dit.upm.es. en el puerto 22
                    <br/>&nbsp;<br/>
                    Las &uacute;ltimas versiones de windows 10 incluyen un cliente OpenSSH con lo que se puede
                    utilizar el modo texto como desde Linux/Mac
                    <br>&nbsp;<br/>(Pase el ratron sobre la figura para ampliar la imagen)
                </span>
                <span class="preview" style="right:50px" id="putty_login_preview" onmouseover="zoomIn('putty_login',event)"></span>
            </div>
    </dd>
    <dt><strong>Acceso desde el ordenador local mediante cliente de escritorio remoto (VNC)</strong></dt>
    <dd>
        <br/>
        Si no desea utilizar el escritorio remoto web y desea utilizar uno propio (p.e: Remina, TightVnc, RealVNC, etc ),
        &eacute;ste deberá ser instalado en su equipo local. El Cliente de Acceso Remoto (rdesktop) que viene de serie con Windows no
        es válido, pues utliza un protocolo distinto ( RDP en lugar de RFB )
    </dd>
    <dd>
        Para acceder desde un Mac-OSX no es necesario instalar servidor VNC adicional: se puede usar el servidor que
        el navegador Safari trae de serie, abriendo la dirección: <em>vnc://<?php echo $host; ?>.lab.dit.upm.es:5900</em>
    </dd>
    <dd>
        Para conectarse al laboratorio, una vez abierta la sesión, deberá utilizar como dirección de acceso,
        la indicada en la ventana de conexión. (p.e: l133.lab.dit.upm.es ) y el puerto 5900/TCP.
        <br/>
        Es recomendable que el cliente VNC soporte encriptación SSL; de lo contrario ser&aacute; necesario establecer un
        t&uacute;nel para establecer la conexi&oacute;n
        <br/>
        Una vez abierto el cliente VNC aparecerá la pantalla de login/contraseña del equipo como si se estuviera frente
        a la consola.
        <br/>&nbsp<br/>
    </dd>
    <dd>
        <strong>Acceso mediante escritorio remoto (vnc) desde Linux</strong>
        <br/>&nbsp;<br/>
            Se asume que el cliente vnc instalado es <a href="https://tigervnc.org/"><em>TigerVNC</em></a>
        <br/>&nbsp;<br/>
        <span class="codigo">
            vncviewer -via <?php echo $user?>@<?php echo $host?>.lab.dit.upm.es <?php echo $host; ?>.lab.dit.upm.es::5900
        </span>
        <br/>&nbsp;<br/>
            En el caso de que el visor VNC no soporte tunel SSH ( opci&oacute;n <em>-via</em> ) será necesario
            crearlo manualmente:
        <br/>&nbsp;<br/>
        <span class="codigo">
            ssh -f -N -L 5900:<?php echo $host; ?>.lab.dit.upm.es:5900 <?php echo $user?>@<?php echo $host?>.lab.dit.upm.es ;
            vncviewer localhost::5900
        </span>
        <br/>&nbsp;<br/>
    </dd>
    <dd>
        <strong>Acceso mediante escritorio remoto (vnc) desde Mac-OSX</strong>
        <br/>&nbsp;<br/>
        En el caso de Mac-OSX, el navegador Safari incorpora un cliente VNC por lo que no es necesario instalarlo<br/>
        No obstante dicho visor VNC no soporta acceso mediante t&uacute;nel SSH, por lo que ser&aacute; necesario crearlo
        abriendo un terminal y ejecutando:
        <br/>&nbsp;<br/>
        <span class="codigo">
            ssh -f -N -L 5900:<?php echo $host; ?>.lab.dit.upm.es:5900 <?php echo $user?>@<?php echo $host?>.lab.dit.upm.es
        </span>
        <br/>&nbsp;<br/>
        Una vez abierto el t&uacute;nel, mediante Safari accedemos a la dirección <em>vnc://localhost:5900</em>
        <br/>&nbsp;<br/>
    </dd>
    <dd>
        <strong>Acceso mediante escritorio remoto (VNC) desde Windows</strong>
        <br/>&nbsp;<br/>
        En el caso de windows no podemos utilizar la aplicaci&oacute;n nativa de escritorio remoto, pues utiliza
        un protocolo distinto - rdesktop(RDP) en lugar de vnc(RFB) -<br/>
        Por ello será necesario descargar e instalar
        las siguientes aplicaciones:
        <ul>
            <li>
                Visor de vnc: <a href="https://www.realvnc.com/es/connect/download/vnc/">RealVnc</a>
                o <a href="https://bintray.com/tigervnc/stable/tigervnc/1.10.1">TigerVNC</a>
            </li>
            <li>Cliente de SSH: <a href="https://www.putty.org/">PuTTy</a></li>
        </ul>
        El cliente SSH PuTTy no es necesario en las &uacute;ltimas actualizaciones de Windows10, pues ya incorporan su propio
        cliente SSH (OpenSSH)
        <br/>&nbsp;<br/>
        <em>Creaci&oacute;n del t&uacute;nel mediante OpenSSH (Windows 10)</em>
        <br/>
        Abrimos la consola PowerShell y ejecutamos el comando:
        <br/>&nbsp;<br/>
        <span class="codigo">
            ssh -f -N -L 5900:<?php echo $host; ?>.lab.dit.upm.es:5900 <?php echo $user?>@<?php echo $host?>.lab.dit.upm.es
        </span>
        <br/>&nbsp;<br/>
        <em>Creaci&oacute;n del t&uacute;nel mediante Putty</em>
        <br/>
        Abrimos PuTTy y lo configuramos seg&uacute;n se indica en las imágenes (mover el rat&oacute;n sobre la figura
        para ampliar la imagen)
        <br/>&nbsp<br/>
        Una vez abierto el t&uacute;nel, bien mediante OpenSSH, bien mediante PuTTy, se arranca el visor VNC
        en la direcci&oacute;n <em><?php echo $host; ?>.lab.dit.upm.es::5900</em>
        <br/>&nbsp<br/>
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