<?php
require_once(__DIR__."/DesktopClientHandler.php");

class MacOSXClientHandler extends DesktopClientHandler {

    // list clients at current location
    function enumerate(){
        $res=array();
        // lista de los macs del laboratorio
        for($i=134;$i<=151;$i++) array_push($res,sprintf("l%03d",$i));
        $this->myLogger->trace("mac list: ".json_encode($res));
        return $res;
    }

}
