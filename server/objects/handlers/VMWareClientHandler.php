<?php
class VMWareClientHandler extends ClientHandler {

    // list clients at current location
    function enumerate(){
        return array();
    }

    // get running status, ip address, machine type and so
    function hostStatus($name,$id=0){
        return array();
    }
    function groupStatus($name, $id = 0, $children = "BEGIN,END") {
        // PENDING: Implement groupStatus() method.
    }
    function serverStatus($name, $id = 0)  {
        // PENDING: Implement serverStatus() method.
    }

    function hostStart($name)  {
        // PENDING: Implement hostStart() method.
    }
    function groupStart($name) {
        // PENDING: Implement groupStart() method.
    }
    function serverStart($name) {
        // PENDING: Implement serverStart() method. WARN ON THIS METHOD as affect to vm server
    }

    function hostStop($name) {
        // PENDING: Implement hostStop() method.
    }
    function groupStop($name) {
        // PENDING: Implement groupStop() method.
    }
    function serverStop($name) {
        // PENDING: Implement serverStop() method. WARN ON THIS METHOD as affect to vm server
    }

    function hostPause($name) {
        // PENDING: Implement hostPause() method.
    }
    function groupPause($name){
        // PENDING: Implement groupPause() method.
    }
    // serverPause is handled on parent class

    function hostResume($name) {
        // PENDING: Implement hostResume() method.
    }
    function groupResume($name) {
        // PENDING: Implement groupResume() method.
    }
    // serverResume is handled on parent class

    function hostDestroy($name) {
        // PENDING: Implement hostDestroy() method.
    }
    function groupDestroy($name) {
        // PENDING: Implement groupDestroy() method. WARN: dangerous in vm server group
    }

    function hostConsole($name) {
        // PENDING: Implement hostConsole() method.
    }
    // groupConsole is handled on parent class
    function serverConsole($name) {
        // PENDING: Implement serverConsole() method.
    }
}