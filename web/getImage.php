<?php
header("Content-Type: image/png");
$host= $_GET["host"];
$image=imagecreatefrompng(__DIR__."/images/icons/base.png");
if (!$image) $image= imagecreate(31,31); // pslm
//$colorWhite=imagecolorallocate($image, 255, 255, 255);
$colorBlack=imagecolorallocate($image, 0, 0, 0);
$colorGrey=imagecolorallocate($image, 128, 128, 128);
imagestring($image,3,1,5,$host,$colorBlack);
imagepng($image);
imagedestroy($image);
?>