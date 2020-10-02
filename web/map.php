<?php
$mapfile=__DIR__."/../config/layout_labo.map";
$rows=@file($mapfile,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
if (!$rows) {
    echo ("<strong>Cannot find mapfile '{$mapfile}'</strong>");
    return;
}
echo "<p>Mapa de recursos del laboratorio</p>";
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
                echo "<img style=\"border:0\" src=\"/labo_sphere/web/images/icons/{$item}.png\"  alt=\"{$item}\">\n";
                break;
            default:
                echo "<span  id=\"img_{$item}\"  style=\"background-color:#C0C000\">\n";
                echo "<img style=\"border:0\" src=\"/labo_sphere/web/getImage.php?host={$item}\" alt=\"{$item}\">\n";
                echo "</span>";
                break;
        }
        echo "<br/>";
    }
}
echo "</table>"
?>