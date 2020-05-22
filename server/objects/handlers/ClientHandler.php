<?php
require_once(__DIR__."/../../../config/config.php");
require_once(__DIR__."/../NetworkInterfaces.php");
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
        if (NetworkInterfaces::isHostAlive($host)<0) return null;
        $connection = @ssh2_connect($host, 22, array('hostkey'=>'ssh-rsa'));
        if (!$connection) return null;
        if ( ! ssh2_auth_pubkey_file($connection, $user,
            Configuration::$ssh_keypath.'/id_rsa.pub',
            Configuration::$ssh_keypath.'/id_rsa') ) {
            return null;
        }
        $fp= ssh2_exec($connection,$command);
        return $fp;
    }

    /**
     * List clients at current location
     */
    protected function enumerate() { return array(); }

    /**
     * get status of server
     */
    function serverStatus($name,$id=0) {
        return array('id'=>$id,'name'=>$name,'ip'=>'','status'=>'','actions'=>'','comments'=>'','children'=>array());
    }

    /**
     * get status of client, ip address, machine type and so
     */
    abstract protected function status($name,$id=0);

    /**
     * start/wakeup client
     */
    protected function start($name) { return true; }

    /**
     * stop/shutdown client
     */
    protected function stop($name) { return true; }

    /**
     * pause/suspend client ( use with care )
     */
    protected function pause($name) { return true; }

    /**
     * resume paused/suspended client
     */
    protected function resume($name) { return true; }

    /**
     * remove client
     */
    protected function destroy($name) { return true; }
}