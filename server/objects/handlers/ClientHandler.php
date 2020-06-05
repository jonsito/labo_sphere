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

    protected function ssh_exec_noreturn($user,$host,$command) {
        $fp=$this->ssh_exec($user,$host,$command);
        if (!$fp) return false;
        fclose($fp);
        return true;
    }

    /**
     * List clients at current location
     * @return array list of web names
     */
    protected function enumerate() { return array(); }

    /**
     * get status of web, ip address, machine type and so
     * ID != 0 means just return on/off and IP address to be inserted in treegrid
     * ID == 0 means return info ( load, memfree, users, and so ) not related with treegrid build
     */
    abstract function hostStatus($name,$id=0);
    abstract function serverStatus($name,$id=0);
    abstract function groupStatus($name,$id=0,$children="BEGIN,END");

    /**
     * start/wakeup web
     */
    abstract function hostStart($name);
    abstract function groupStart($name);
    abstract function serverStart($name);

    /**
     * stop/shutdown web
     */
    abstract function hostStop($name);
    abstract function serverStop($name);
    abstract function groupStop($name);

    /**
     * pause/suspend web ( use with care )
     */
    abstract function hostPause($name);
             function serverPause($name) { return "Cannot pause server {$name} from admin interface"; }
    abstract function groupPause($name);

    /**
     * resume paused/suspended web
     */
    abstract function hostResume($name);
             function serverResume($name) { return "Cannot resume server {$name} from admin interface"; }
    abstract function groupResume($name);

    /**
     * remove web
     */
    abstract function hostDestroy($name);
             function serverDestroy($name) { return "Cannot destroy machine {$name} from admin interface"; }
    abstract function groupDestroy($name);

    /*
     * fire up ssh console
     */
    protected function hostConsole($name) {
        // make sure that ssh websocket interface is up and running
        @exec("pgrep wsproxy",$output,$status);
        if ($status!=0) { // wsproxy is not running. fireup
            @exec("nohup wsproxy 2>&1 >> /var/www/html/labo_sphere/logs/wsproxy.log &",$output,$status);
            if($status!=0) return "hostConsole({$name}): Failed to start ws proxy for ssh web consoles";
        }
        // return parameters for ssh web console interface
        return array("success" => true, "data" => "host={$name}.lab.dit.upm.es&user=cdc&hmode=1&umode=0" );
    }
    function groupConsole($name) { return "Cannot fire up multiple consoles at once"; }
    abstract function serverConsole($name);
}