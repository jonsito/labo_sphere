<?php
require_once(__DIR__ . "/server/tools.php");
$admin=http_request("admin","i",-1);
$showdoc=http_request("help","i",0); // default is tab 0:operation ( 1:docs )
if ($admin<0) {
    // no admin mode forced: check client ip address
    $admin=(strpos($_SERVER['REMOTE_ADDR'],"138.4.")===FALSE)?0:1;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="utf-8"/>
    <title>
        Lab-Dit Gestor de acceso remoto
    </title>
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/libs/jquery-easyui-1.9.5/themes/default/easyui.css">
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/libs/jquery-easyui-1.9.5/themes/icon.css">
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/libs/jquery-easyui-1.9.5/demo/demo.css">
    <link rel="stylesheet" type="text/css" href="/labo_sphere/web/css/style.css">
    <script type="text/javascript" src="/labo_sphere/web/libs/jquery-easyui-1.9.5/jquery.min.js"></script>
    <script type="text/javascript" src="/labo_sphere/web/libs/jquery-easyui-1.9.5/jquery.easyui.min.js"></script>
    <script type="text/javascript" src="/labo_sphere/web/libs/easyui-patches.js"></script>
    <script type="text/javascript" src="/labo_sphere/web/libs/actions.js"></script>
    <script type="text/javascript">

        var window_desktop=null;
        var window_console=null;
        var admin_console=null;
        var enable_adm=<?php echo $admin;?>;

        /* gestion del zoom de imagenes en la documentacion */
        /* https://www.codesdope.com/blog/article/mouse-rollover-zoom-effect-on-images/ */
        function zoomIn(id,event) {
            var elm=$('#'+id);
            var pre=$('#'+id+'_preview');
            pre.css('visibility','visible');
            if (elm.is(':hover')) {
                /*pre.css('border','1px solid black'); */
                pre.css('backgroundImage',"url('/labo_sphere/web/images/"+id+".png')");
            }
            var posX = event.offsetX;
            var posY = event.offsetY;
            pre.css('backgroundPosition',(-posX)+"px "+(-posY)+"px");
        }

        function zoomOut(id) {
            var pre=$('#'+id+'_preview');
            pre.css('visibility','hidden');
        }

        /* presenta una ventana auxiliar con la imagen ampliada */
        var zoomedImage;
        function showImage(img) {
            var msg='<img src="/labo_sphere/web/images/'+img+'.png" alt="'+img+'" style="width:670px;padding:0px" onclick="zoomedImage.dialog(\'close\')">';
            zoomedImage=$.messager.show({
                padding:0,
                modal:true,
                width:700,
                height:'auto',
                title:'Zoom',
                msg: msg,
                timeout:0,
                showType:'fade',
                showSpeed:700,
                style:{ right:'', bottom:'' }
            });
        }
        /* termina la configuracion al arrancar la pagina */
        function initialize() {
            // check browser. If internet explorer redirect to "invalid browser page"
            var isIE = /MSIE|Trident/.test(window.navigator.userAgent);
            if ( isIE ) {
                setTimeout(function() { window.location.href="/labo_sphere/inv_browser.html"; },0);
            }
            // prepare all easyui objects
            $('#sesion_host').textbox({
                value:'',
                validType:"regexp['^l[0-9]{3}$']",
                invalidMessage:'Enter valid host name. i.e: l067',
                height:20,
                onChange: function(newval,oldval) {
                    let sh=$('#sesion_host');
                    if (sh.textbox('isValid')) $('#sesion_hostrb').prop("checked",true);
                    else sh.textbox('setValue',''); // invalid value: clear and forget
                }
            });
            $('#formulario').form('clear');
            $('#duration').combobox({
                height:20,
                width:120,
                panelHeight:'auto',
                value:'7200'
            });
            $('#virtual').combobox({
                height:18,
                width:150,
                panelHeight:'auto',
                value:'virtual_ftel',
                // need to revise
                onChange: function(newValue,oldValue) { $('#selected_sesion').val(newValue); }
            });
            $('#labo').combobox({
                height:18,
                width:150,
                panelHeight:'auto',
                value:'laboA',
                onChange: function(newValue,oldValue) { $('#selected_sesion').val(newValue); }
            });
            $('#username').textbox({
                validType:"regexp['^[a-z]+[0-9a-z_\.\-]*$']",
                invalidMessage:'Formato inv&aacute;lido: el usuario no puede incluir<br/>direcciones de correo ni letras mayusculas',
                prompt: 'User name',
                iconCls:'icon-man'
            });
            $('#username').textbox('textbox').bind('keydown', function(e){
                if (e.keyCode === 13){   // when press ENTER key, accept the inputed value.
                    $('#username').textbox( 'setValue', $(this).val() );
                    $('#password').passwordbox('textbox').focus();
                }
            });
            $('#password').passwordbox({
                prompt: 'Password',
                showEye: true,
                checkInterval: 10,
                lastDelay: 10
            });
            $('#password').passwordbox('textbox').bind('keydown', function(e){
                if (e.keyCode === 13){   // when press ENTER key, accept the inputed value.
                    $('#password').passwordbox( 'setValue', $(this).val() );
                    acceder('tunel');
                }
            });
            var ls= $('#labo_sphere-tabs');
            ls.tabs({
                height:450,
                width:'100%'
            });
            ls.tabs('getTab','Instrucciones').panel('refresh','web/instrucciones.php');
            ls.tabs('select',<?php echo $showdoc; ?>);

            $('#labo_sphere-layout').layout({
                    fit:true,
            });
            ls.tabs('resize');
            $('#selected_sesion').val('LaboA');
            $('#family_labo').prop("checked", true);
            selectFamily('labo');
            $('#admin_radio').css('display',(enable_adm===0)?'none':'inherit');
        }

        function selectFamily(family) {
            let ss=$('#selected_sesion');
            let dur=$('#duration');
            $('#labo_span').css('display',(family==='labo')?'inline-block':'none');
            $('#virtual_span').css('display',(family==='newvm')?'inline-block':'none');
            if (family==='labo') ss.val($('#labo').combobox('getValue'));
            if (family==='newvm') ss.val($('#virtual').combobox('getValue'));
            if (family==='admin') ss.val('admin');
            if (family==='host') {
                ss.val('host');
            } else {
                // on setFamily != 'host' make sure that host is empty and timeout not zero
                if (parseInt(dur.combobox('getValue'))===0) dur.combobox('setValue',7200);
                $('#sesion_host').textbox('setValue','');
            }
        }

        function acceder(tipo) { // desktop, console, tunel
            // if ok then ask for selected session/option
            var username=$('#username').textbox('getValue');
            var password=$('#password').passwordbox('getValue');
            var duration=$('#duration').combobox('getValue');
            var mode=$('#selected_sesion').val(); // input hidden
            var host=$('#sesion_host').textbox('getValue');
            if(username==="" || password==="") {
                $.messager.alert("Error","Debe indicar usuario y contrase&ntilde;a","error");
                return;
            }
            if(mode.indexOf('virtual_')>=0) {
                $.messager.alert("No disponible","El despliegue de m&aacute;quinas virtuales no est&aacute; todav&iacute;a disponible","error");
                return;
            }
            if( (mode==='host') && (host==='') ) {
                $.messager.alert("Error","Debe indicar un puesto de laboratorio","error");
                return;
            }
            // en el caso de admin hay que desplegar una nueva ventana
            if (mode==="admin") {
                $('#formulario').submit();
                return;
            }
            if (parseInt(duration)===0) {
                $.messager.confirm(
                    'Finalizar',
                    "Al cerrar sesi&oacute;n finalizar&aacute;n todas las ventanas y conexiones<br/>que estuvieran establecidas con '"+host+"'<br/>&nbsp;<br/>Cerrar sesi&oacute;n ¿seguro?",
                    function(r){
                        if (r){
                        labo_session(mode,tipo,duration);
                    }
                }).window({width:400,height:200});
            } else labo_session(mode,tipo,duration);

            return false; // do not continue chain -> do not invoke submit on console/desktop buttons
        }

        function clear_sesion(host) {
            // actualzamos datos de conexion, por si acaso el operador los ha cambiado
            $("#family_host").prop("checked", true);
            selectFamily('host');
            $('#sesion_host').textbox('setValue',host);
            $('#duration').combobox('setValue',7200); // default again to 2 hours
            $('#labo_sphere-layout').layout('panel','east').panel('refresh','web/sesion_info.php');
            $.messager.alert(
                "Timeout",
                "La sesi&oacute;n con el equipo '"+host+"' ha expirado<br/>En breves momentos el sistema cerrar&aacute; la conexi&oacute;n",
                "info").window({width:450,height:150});
        }

        // fix configuration and call "acceder" from buttons in info/instructions panels
        function button_sesion(host,action) { // host, desktop/console/tunel
            // actualzamos datos de conexion, por si acaso el operador los ha cambiado
            $("#family_host").prop("checked", true);
            selectFamily('host');
            $('#sesion_host').textbox('setValue',host);
            // ajustamos timeout a cero
            if (action==='tunel') $('#duration').combobox('setValue',0);
            // invocamos al botón "acceder"
            setTimeout(function() {acceder(action);},0);
        }

        // convert seconds to hh:mm[:ss]
        String.prototype.toHHMMSS = function (showsecs) {
            var sec_num = parseInt(this, 10); // don't forget the second parm
            var hours = Math.floor(sec_num / 3600);
            var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
            var seconds = sec_num - (hours * 3600) - (minutes * 60);
            if (hours < 10) { hours = "0" + hours; }
            if (minutes < 10) { minutes = "0" + minutes; }
            if (seconds < 10) { seconds = "0" + seconds; }
            var time = hours + ':' + minutes;
            if (showsecs) time += ':' + seconds;
            return time;
        }
    </script>
</head>

<style type="text/css">
.cabecera {
    height:150px;
    background: url('web/images/cdcTitle.png') no-repeat left top;
    margin-top: -20px
}
.cabecera p {
    font-size:1.6vw;
    font-style:oblique;
    font-weight:bold;
    text-align:right;
    position:relative;
    top:120px;
    right:25px
}
</style>

<body onload="initialize()">
<form id="formulario" method="POST" action="web/admin.php" >

    <input type="hidden" name="sesion" id="selected_sesion" value="laboA"/>
    <input type="hidden" name="sesion" id="countdown" value="0"/>

    <div class="cabecera">
        <p> Servicio de acceso remoto a los laboratorios docentes </p>
    </div>

    <div id="labo_sphere-tabs">

        <div title="Configuraci&oacute;n" style="padding:5px;">

            <div id="labo_sphere-layout">

                <div data-options="region:'center',title:'Introducci&oacute;n de datos'" style="padding:5px 5px 5px 20px;background:#eee;">
                    <h2>
                        Identificaci&oacute;n:
                    </h2>
                    <p>
                        Por favor: introduzca los credenciales de su cuenta del laboratorio<br/>
                        Si no tiene cuenta, o no recuerda la contrase&ntilde;a, pulse <a href="http://www.lab.dit.upm.es/labng">aqu&iacute;</a>
                        <br/>
                        <span style="display:inline-block;width:400px;text-align:right;padding:10px">
                            <label for="username">Nombre de usuario</label>
                            <input type="text" name="username" id="username" value=""/> <br/>
                            <label for="password">Contrase&ntilde;a</label>
                            <input type="text" name="password" id="password" value=""/>
                        </span>
                    </p>

                    <h2>
                        <span style="display:inline-block;width:40%;text-align:left">Seleccione opci&oacute;n:</span>
                    </h2>
                    <ul style="list-style-type:none">

                        <li>
                            <input type="radio" name="family" id="family_labo" value="labo" onclick="selectFamily('labo');"/>
                            <label for="family_labo">Acceso a equipos del laboratorio</label>
                            <span id="labo_span" style="text-align:center;display:none">
                                <select id="labo" name="labo" class="easyui-combobox">
                                    <option value="laboA" selected="selected">Lab. Edificio A</option>
                                    <option value="laboB">Lab. Edificio B</option>
                                    <option value="macs">Equipos Mac-OSX</option>
                                    <option value="virtual">Puestos virtuales</option>
                                </select>
                            </span>
                        </li>

                        <li>
                            <input type="radio" name="family" id="family_newvm" value="newvm"  onclick="selectFamily('newvm');"/>
                            <label for="family_newvm">Desplegar una m&aacute;quina virtual</label>
                            <span id="virtual_span" style="text-align:center;display:none">
                                <select id="virtual" name="virtual" class="easyui-combobox">
                                    <option value="virtual_ftel" selected="selected">Ubuntu FTEL</option>
                                    <option value="virtual_mac">Mac OSX-Catalina</option>
                                    <option value="virtual_windows10">Windows 10 Pro</option>
                                </select>
                            </span>
                        </li>

                        <li>
                            <input type="radio" name="family" id="family_host" value="host" onclick="selectFamily('host');"/>
                            <label for="sesion_host">Acceso al equipo:</label>
                            <input name="host" value="" id="sesion_host" size="4" maxlength="4"/>
                        </li>
                        <li id="admin_radio" style="display:none"><input type="radio" name="family" id="family_admin" value="admin" onclick="selectFamily('admin');"/>
                            <label for="family_admin">Acceso (restringido) al interfaz de gesti&oacute;n</label>
                        </li>

                    </ul>

                    <h2 style="width:100%">
                        <span style="display:inline-block;text-align:left">
                        <label for="duration">Duraci&oacute;n de la sesi&oacute;n:</label>
                        <select id="duration" name="duration" class="easyui-combobox">
                            <option value="3600">1 hora</option>
                            <option value="7200" selected="selected">2 horas</option>
                            <option value="14400">4 horas</option>
                            <option value="21600">6 horas</option>
                            <option value="0">Cerrar sesi&oacute;n</option>
                        </select>
                        </span>

                        <span style="display:inline-block;position:absolute;bottom:15px;right:25px">
                            <input type="button" onclick="acceder('tunel');" value="Acceder"/>
                        </span>
                    </h2>
                </div> <!-- ventana de entrada de datos -->

                <!-- ventana de conexiones activas -->
                <div id="conexiones" style="width:45%;padding:5px 5px 5px 20px"
                     data-options="region:'east',title:'Informaci&oacute;n de la sesi&oacute;n',collapsible:false, href:'web/sesion_info.php'" >
                    <p>
                        No se ha iniciado sesi&oacute;n
                    </p>
                </div> <-- ventana de conexiones activas ->

            </div> <!-- layout -->
        </div> <!-- datos de acceso tab -->

        <!-- pestanya de instrucciones -->
        <div id="instrucciones" title="Instrucciones" style="padding:5px;">
                <h2>Instrucciones de acceso</h2>
        </div> <!-- "instrucciones tab" -->

    </div> <!-- easyui-tabs -->
</form>
<footer>
    <br/>
    Esta p&aacute;gina NO utiliza cookies. Consulte las condiciones generales de acceso y uso del laboratorio en:
    <a href="https://www.lab.dit.upm.es/labng/pdf/normas.pdf">https://www.lab.dit.upm.es/labng/pdf/normas.pdf</a>
    <br/>&nbsp;<br/>
    Se recuerda al usuario que todos los accesos ( tanto v&aacute;lidos como fallidos ) son registrados con fines
    de elaboraci&oacute;n de estad&iacute;sticas y trazado de incidencias.<br/>
    En concreto se guarda información sobre la hora de acceso, el nombre del usuario, la duración de la sesión,
    y las direcciones IP de las m&aacute;quinas origen y destino de la conexi&oacute;n
    <hr/>
    P&aacute;gina principal del <a href="http://www.lab.dit.upm.es">Laboratorio</a><br/>
    P&aacute;gina web del <a href="http://www.dit.upm.es">Departamento</a>
</footer>
</body>
</html>