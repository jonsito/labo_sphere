<?php
class ServerClientHandler extends ClientHandler {

    // list clients at current location
    function enumerate(){
        return array();
    }

    // start/wakeup web
    function hostStart($name) {
        return "";
    }
    function groupStart($name) {
        // PENDING: Implement groupStart() method.
        return "";
    }
    function serverStart($name) {
        // PENDING: Implement serverStart() method.
        return "";
    }

    // stop/shutdown web
    function hostStop($name){
        return "";
    }
    function groupStop($name) {
        // PENDING: Implement groupStop() method.
        return "";
    }
    function serverStop($name) {
        // PENDING: Implement serverStop() method.
        return "";
    }


    // pause/suspend web ( use with care )
    function hostPause($name){
        return "";
    }
    function groupPause($name) {
        // PENDING: Implement groupPause() method.
        return 0;
    }
    // serverPause is handled on parent class


    // resume paused/suspended web
    function hostResume($name){
        return "";
    }
    function groupResume($name) {
        // PENDING: Implement groupResume() method.
        return "";
    }
    // serverResume is handled on parent class

    // remove web
    function hostDestroy($name){
        return "";
    }
    function groupDestroy($name) {
        // PENDING: Implement groupDestroy() method.
        return "";
    }
    // serverDestroy is handled on parent class

    // get running status, ip address, machine type and so
    function hostStatus($name,$id=0){
        return array();
    }
    function groupStatus($name, $id = 0, $children = "BEGIN,END") {
        // pending: Implement groupStatus() method.
        return array();
    }
    function serverStatus($name, $id = 0) {
        // PENDING: Implement serverStatus() method.
        return "";
    }

    function hostConsole($name) {
        // TODO: Implement hostConsole() method.
        return "";
    }
    // group console is handled on parent class
    function serverConsole($name) {
        // TODO: Implement serverConsole() method.
        return "";
    }
}