<?php

$mapfile=__DIR__."/../config/layout_labo.map";
$rows=@file($mapfile,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
if (!$rows) {
    echo ("<strong>Cannot find mapfile '{$mapfile}'</strong>");
    return;
}
echo "<table>";
foreach ($rows as $row) {
    echo "<tr>";
    $items=explode(":",$row);
    foreach ($items as $item) {
        echo '<td style="padding:0px">';
        switch ($item) {
            case "wall":
            case "wind":
            case "door":
            case "null":
            case "none":
            case "serv":
                echo "<img src=\"/labo_spher/web/images/icons/{$item}.png\" width=\"32\" height=\"32\" alt=\"{$item}\">\n";
                break;
            default:
                echo "<img id=\"img_{$item}\" src=\"/labo_sphere/web/getImage.php?host={$item}&mode=0\" width=\"31\" height=\"31\" alt=\"{$item}\">\n";
                break;
        }
        echo "</td>";
    }
    echo "</tr>";
}
echo "</table>"
?>