<?php

$mapfile=__DIR__."../config/layout_labo.map";
$rows=@file($mapfile,FILE_IGNORE_NEW_LINES|FILE_SKIP_EMPTY_LINES);
if (!$rows) {
    echo ("<strong>Cannot find mapfile '{$mapfile}'</strong>");
    return;
}
echo "<table>";
foreach ($rows as $row) {
    echo "<tr>";
    foreach ($row as $item) {
        echo '<td style=="padding:0px">';
        switch ($item) {
            case "wall":
            case "wind":
            case "door":
            case "null":
            case "none":
            case "serv":
                echo "<td><img src=\"images/icons/{$item}.png\" width=\"32\" height=\"32\" alt=\"{$item}\"></td>\n";
                break;
            default:
                echo "<td><img id=\"img_{$item}\" src=\"images/getImage.php?host={$item}&mode=0\" width=\"32\" height=\"32\" alt=\"{$item}\"></td>\n";
                break;
        }
        echo "</td>";
    }
    echo "</tr>";
}
echo "</table>"
?>