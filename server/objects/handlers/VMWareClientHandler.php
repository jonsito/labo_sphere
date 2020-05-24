<?php
class VMWareClientHandler extends ClientHandler {

    // list clients at current location
    function enumerate(){
        return array();
    }

    // start/wakeup client
    function start($name){

    }

    // stop/shutdown client
    function stop($name){

    }

    // pause/suspend client ( use with care )
    function pause($name){

    }

    // resume paused/suspended client
    function resume($name){

    }

    // remove client
    function destroy($name){

    }

    // get running status, ip address, machine type and so
    function hostStatus($id,$name){
        return array();
    }
}