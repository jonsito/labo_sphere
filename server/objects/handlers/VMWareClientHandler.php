<?php
class VMWareClientHandler extends ClientHandler {

    // list clients at current location
    function enumerate(){
        return array();
    }

    // start/wakeup web
    function start($name){

    }

    // stop/shutdown web
    function stop($name){

    }

    // pause/suspend web ( use with care )
    function pause($name){

    }

    // resume paused/suspended web
    function resume($name){

    }

    // remove web
    function destroy($name){

    }

    // get running status, ip address, machine type and so
    function hostStatus($id,$name){
        return array();
    }
}