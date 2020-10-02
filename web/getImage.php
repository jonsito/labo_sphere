<?php
header("Content-Type: image/png");
$host= $_GET["host"];
$mode= $_GET["mode"];

switch($mode) {
    case -1: $img="unknown";
    case 0: $img="off";
    case 1: $img="on";
    case 2: $img="busy";
    default: $img="base";
}
$image=imagecreatefrompng(__DIR__."/images/icons/{$img}.png");
if (!$image) $image= imagecreate(31,31); // pslm
//$colorWhite=imagecolorallocate($image, 255, 255, 255);
$colorBlack=imagecolorallocate($image, 0, 0, 0);
$colorGrey=imagecolorallocate($image, 128, 128, 128);
imagestring($image,3,1,5,$host,$colorBlack);
imagepng($image);
imagedestroy($image);
?>