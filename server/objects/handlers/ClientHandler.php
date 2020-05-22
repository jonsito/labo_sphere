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
        switch ($type) {
            case "VboxClientHandler" : return new VboxClientHandler($location);
            case "DesktopClientHandler" : return new DesktopClientHandler($location);
            case "ServerClientHandler" : return new ServerClientHandler($location);
            case "VMWareClientHandler" : return new VMWareClientHandler($location);
        }
        return null; //error
    }

    protected function ssh_exec( $user,$host,$command) {
        $connection = ssh2_connect($host, 22, array('hostkey'=>'ssh-rsa'));
        if ( ! ssh2_auth_pubkey_file($connection, $user,
            '/usr/share/httpd/.ssh/id_rsa.pub',
            '/usr/share/httpd/.ssh/id_rsa') ) {
            return null;
        }
        $fp= ssh2_exec($connection,$command);
        return $fp;
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