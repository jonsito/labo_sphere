<?php
require_once(__DIR__."/../../logging.php");
require_once(__DIR__."/../../../config/config.php");
require_once(__DIR__."/../NetworkInterfaces.php");
require_once(__DIR__."/VboxClientHandler.php");
require_once(__DIR__."/DesktopClientHandler.php");
require_once(__DIR__."/ServerClientHandler.php");
require_once(__DIR__."/VMWareClientHandler.php");

abstract class ClientHandler {
    protected $location;
    protected $myLogger;

    public function __construct($location) {
        $this->location=$location;
        $this->myLogger=new Logger("ClientHandler",LEVEL_TRACE);
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
        if (NetworkInterfaces::isHostAlive($host)<0) return null;
        $connection = @ssh2_connect($host, 22, array('hostkey'=>'ssh-rsa'));
        if (!$connection) {
            $this->myLogger->notice("Cannot ssh connect to server {$host}");
            return null;
        }
        if ( ! ssh2_auth_pubkey_file($connection, $user,
            Configuration::$ssh_keypath.'/id_rsa.pub',
            Configuration::$ssh_keypath.'/id_rsa') ) {
            $this->myLogger->notice("Cannot ssh auth with server {$host}");
            return null;
        }
        $fp= ssh2_exec($connection,$command);
        if (!$fp) $this->myLogger->error("Execution of ssh {$user}@{$host} {$command} failed");
        return $fp;
    }

    /**
     * List clients at current location
     * @return array list of web names
     */
    protected function enumerate() { return array(); }

    /**
     * get status of server group
     * should be overriden
     */
    function groupStatus($id,$name,$children) {
        sleep(3); // remove when code completed
        return array();
    }

    /**
     * get status of web, ip address, machine type and so
     */
    abstract protected function hostStatus($id,$name);

    /**
     * start/wakeup web
     */
    protected function start($name) { return true; }

    /**
     * stop/shutdown web
     */
    protected function stop($name) { return true; }

    /**
     * pause/suspend web ( use with care )
     */
    protected function pause($name) { return true; }

    /**
     * resume paused/suspended web
     */
    protected function resume($name) { return true; }

    /**
     * remove web
     */
    protected function destroy($name) { return true; }
}