<?php

$mapfile=__DIR__."/../config/layout_labo.map";
$rows=@file($mapfile,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
if (!$rows) {
    echo ("<strong>Cannot find mapfile '{$mapfile}'</strong>");
    return;
}
echo '<table style="border:0">';
foreach ($rows as $row) {
    echo "<tr>";
    $items=explode(":",$row);
    foreach ($items as $item) {
        echo '<td id="img_{$item}" style="padding:0px;background:#C0C000">';
        switch ($item) {
            case "wall":
            case "wind":
            case "door":
            case "null":
            case "none":
            case "serv":
                echo "<img src=\"/labo_sphere/web/images/icons/{$item}.png\" width=\"30\" height=\"30\" alt=\"{$item}\">\n";
                break;
            default:
                echo "<img id=\"img_{$item}\" src=\"/labo_sphere/web/getImage.php?host={$item}\" width=\"30\" height=\"30\" alt=\"{$item}\">\n";
                break;
        }
        echo "</td>";
    }
    echo "</tr>";
}
echo "</table>"
?>