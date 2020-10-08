<?php
$mapfile=__DIR__."/../config/layout_labo.map";
$rows=@file($mapfile,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
if (!$rows) {
    echo ("<strong>Cannot find mapfile '{$mapfile}'</strong>");
    return;
}
echo "<p><strong>Distribuci&oacute;n de los recursos del laboratorio</strong></p>";
echo '<p style="overflow:auto;display:inline-block">';
foreach ($rows as $row) {
    $items=explode(":",$row);
    foreach ($items as $item) {
        switch ($item) {
            case "wall":
            case "wind":
            case "door":
            case "null":
            case "none":
            case "serv":
                echo "<img style=\"border:0\" src=\"/labo_sphere/web/images/icons/{$item}.png\"  alt=\"{$item}\">";
                break;
            default:
                ?><a href="#" class="cl_menu" id="img_<?php echo $item; ?>" ><img style="border:0"
                         src="/labo_sphere/web/getImage.php?host=<?php echo $item; ?>"
                         alt="<?php echo $item; ?>"
                         class="easyui-tooltip" data-options="
                            position: 'top',
                            onShow: function(e) { $(this).tooltip('update',getToolTip('<?php echo $item; ?>')); }
                         "
                    ></a><?php
                break;
        }
    }
    echo "<br/>";
}
echo "</p>"
?>
<div id="map_menu" style="width:120px;">
    <div data-options="iconCls:'icon-redo'">Start</div>
    <div data-options="iconCls:'icon-reload'">Restart</div>
    <div data-options="iconCls:'icon-undo'">Stop</div>
    <div class="menu-sep"></div>
    <div data-options="iconCls:'icon-console'">SSH Console</div>
</div>

<script>
    $(function(){
        $('#map_menu').menu();
        $(".cl_menu").bind('contextmenu',function(e){
            e.preventDefault();
            $('#map_menu').menu('show', {
                left: e.pageX,
                top: e.pageY
            });
        });
    });
</script>
