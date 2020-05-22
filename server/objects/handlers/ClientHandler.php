<?php
require_once(__DIR__."/VboxClientHandler.php");
require_once(__DIR__."/DesktopClientHandler.php");
require_once(__DIR__."/ServerClientHandler.php");
require_once(__DIR__."/VMWareClientHandler.php");

abstract class ClientHandler {
    protected $location;
    public function __construct($location) {
        $this->location=$location;
    }

    public static function getInstance($type,$location) {
        $a=new $type($location);
        return $a;
    }

    // list clients at current location
    abstract protected function enumerate();
    // get running status, ip address, machine type and so
    abstract protected function status($name,$id=0);
    // start/wakeup client
    abstract protected function start($name);
    // stop/shutdown client
    abstract protected function stop($name);
    // pause/suspend client ( use with care )
    abstract protected function pause($name);
    // resume paused/suspended client
    abstract protected function resume($name);
    // remove client
    abstract protected function destroy($name);
}