<?php


abstract class ClientHandler {
    protected $location;
    public function ClientHandler($location) {
        $this->location=$location;
    }
    // list clients at current location
    abstract protected function enumerate($running);
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
    // get running status, ip address, machine type and so
    abstract protected function status($name);
}