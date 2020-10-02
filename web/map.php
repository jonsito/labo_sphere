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
                ?><a href="#" id="img_<?php echo $item; ?>" ><img style="border:0"
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