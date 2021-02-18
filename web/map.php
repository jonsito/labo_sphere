<?php
$mapfile=__DIR__."/../config/layout_labo.map";
$rows=@file($mapfile,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
if (!$rows) {
    echo ("<strong>Cannot find mapfile '{$mapfile}'</strong>");
    return;
}
echo "<h2><em>Distribuci&oacute;n de los recursos del laboratorio</em></h>";
echo "<p style=\"font-size:0.8vw\">Desplazar el rat&oacute;n sobre un equipo para ver informaci&oacute;n de su estado<br>Pulsar el bot&oacute;n derecho para desplegar opciones</p>";
echo '<p style="overflow:auto;display:inline-block">';
foreach ($rows as $row) {
    $items=explode(":",$row);
    foreach ($items as $item) {
        $a=explode(",",$item);
        switch ($a[0]) {
            case "wall":
            case "wind":
            case "door":
            case "null":
            case "none":
            case "serv":
                echo "<img style=\"border:0\" src=\"/labo_sphere/web/images/icons/{$a[0]}.png\"  alt=\"{$item}\">";
                break;
            case "sock":
                ?><a href="#" class="cl_sock" id="sock_<?php echo $item; ?>" ><img style="border:0"
                        src="/labo_sphere/web/images/icons/<?php echo $a[0]; ?>.png"
                        alt="<?php echo $item; ?>"
                        class="easyui-tooltip" data-options="
                            position: 'top',
                            onShow: function(e) { $(this).tooltip('update',getSockTip('<?php echo $item; ?>')); }
                        "></a><?php
                break;
            default:
                ?><a href="#" class="cl_menu" id="img_<?php echo $a[0]; ?>" ><img style="border:0"
                     src="/labo_sphere/web/getImage.php?host=<?php echo $a[0]; ?>"
                     alt="<?php echo $item; ?>"
                     class="easyui-tooltip" data-options="
                        position: 'top',
                        onShow: function(e) { $(this).tooltip('update',getToolTip('<?php echo $a[0]; ?>')); }
                     "></a><?php
                break;
        }
    }
    echo "<br/>";
}
echo "</p>"
?>
<div id="map_menu" style="width:120px;">
    <div><strong>Host: <span id="current_host"></span></strong></div>
    <div class="menu-sep"></div>
    <div data-options="iconCls:'icon-redo'" onclick="fireActionFromMap('start')">Start</div>
    <div data-options="iconCls:'icon-reload'" onclick="fireActionFromMap('restart')">Restart</div>
    <div data-options="iconCls:'icon-undo'" onclick="fireActionFromMap('stop')">Stop</div>
    <div class="menu-sep"></div>
    <div data-options="iconCls:'icon-no'" onclick="fireActionFromMap('kill')">Kill Session(s)</div>
    <div class="menu-sep"></div>
    <div data-options="iconCls:'icon-console'" onclick="fireActionFromMap('console')">SSH Console</div>
</div>

<div id="sock_menu" style="width:200px;">
    <div><strong>PowerIP: <span id="powerip"></span> Socket: <span id="socket"></span></strong></div>
    <div><strong>Hosts: </strong><span id="hostlist"></span></div>
    <div class="menu-sep"></div>
    <div data-options="iconCls:'icon-on'" onclick="fireActionFromMap('poweron')">Power On</div>
    <div data-options="iconCls:'icon-reload'" onclick="fireActionFromMap('restart')">Restart</div>
    <div data-options="iconCls:'icon-off'" onclick="fireActionFromMap('poweroff')">Power Off</div>
</div>

<script>
    var hostsBySocket;
    $(function(){
        // iteramos el mapa agrupando hosts por powerip
<?php
        $hostsList=array();
        foreach ($rows as $row) {
            $items=explode(":",$row);
            foreach ($items as $item) {
                $a = explode(",", $item);
                if (count($a)!==3) continue;
                switch ($a[0]) {
                    case "sock":
                    case "wall":
                    case "wind":
                    case "door":
                    case "null":
                    case "none":
                    case "serv":
                        break; // lXXX
                    default:
                        $key = "{$a[1]},{$a[2]}";
                        if (array_key_exists($key,$hostsList)) $hostsList[$key] .= ",{$a[0]}";
                        else $hostsList[$key] = $a[0];
                        break;
                } // switch
            } // foreach item in row
        }
        echo "hostsBySocket=".json_encode($hostsList).";";
?>
        $('#map_menu').menu();
        $('#sock_menu').menu();
        $(".cl_menu").bind('contextmenu',function(e){
            e.preventDefault();
            $('#current_host').html(e.target.alt.split(",")[0]);
            $('#map_menu').menu('show', {
                left: e.pageX,
                top: e.pageY
            });
        });
        $(".cl_sock").bind('contextmenu',function(e){
            e.preventDefault();
            let a=e.target.alt.split(",");
            $('#powerip').html(a[1]);
            $('#socket').html(a[2]);
            $('#hostlist').html(hostsBySocket[''+a[1]+','+a[2]]);
            $('#sock_menu').menu('show', {
                left: e.pageX,
                top: e.pageY
            });
        });
    });
</script>
