<?php
class MacOSXClientHandler extends DesktopClientHandler {

    // list clients at current location
    function enumerate(){
        $res=array();
        foreach(array(134, 135, 136, 140, 143, 144, 145, 146, 148) as $item) {
            array_push($res,sprintf("l%03d",$item));
        }
        return $res;
    }

}