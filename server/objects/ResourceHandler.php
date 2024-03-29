<?php
require_once(__DIR__."/../logging.php");
require_once(__DIR__."/../../config/config.php");
require_once(__DIR__."/NetworkInterfaces.php");

class ResourceHandler
{
    protected $remote_dir = "/home/operador/administracion/servicios_ubuntu-20.04/tools";
    protected $remote_cmd = "/home/operador/administracion/servicios_ubuntu-20.04/tools/labo_sphere.sh";
    protected $user;
    protected $password;
    protected $myLogger;

    function __construct($user, $pass)
    {
        $this->user = $user;
        $this->password = $pass;
        $this->myLogger = new Logger("ResourceHandler", LEVEL_TRACE);
    }

    /*
     * Call maestro to fire up required resources to launch ssh/vpn/tunnel
     * Notice that provided ssh key should be restricted in host maestro
     * to execute only script
     */
    protected function callMaestro($command,$multiline=false)
    {
        $host = "maestro.lab.dit.upm.es";
        $connection = @ssh2_connect($host, 22, array('hostkey' => 'ssh-rsa'));
        if (!$connection) {
            $this->myLogger->notice("Cannot ssh connect to server {$host}");
            return null;
        }
        if (!ssh2_auth_pubkey_file($connection, "root",
            Configuration::$ssh_keypath . '/id_rsa.pub',
            Configuration::$ssh_keypath . '/id_rsa')) {
            $this->myLogger->notice("Cannot ssh auth with server {$host}");
            return null;
        }
        $fp = ssh2_exec($connection, $command);
        if (!$fp) $this->myLogger->error("Execution of ssh {$command} on maestro.lab failed");
        stream_set_blocking($fp, true);
        $res="";
        if ($multiline==false) {
            $res = trim(fgets($fp)); // these functions only return host:port json string
        } else {
            while ( ($line=fgets($fp))!==false ) $res.=$line;
        }
        fclose($fp);
        return $res;
    }

    // find of type("desktop","console","tunel")
    // on resource name ("a127","b123","virtual","macs","newvm") or given host
    public function fireUp($name, $type, $host = "none", $timeout = 0)
    {
        // $this->myLogger->enter("findResourece($name)");
        // PENDING: real work of find, deploy and start a free resource
        switch ($type) {
            case 'desktop':
                $cmd = $this->remote_cmd . " vnc_console ";
                break;
            case 'console':
                $cmd = $this->remote_cmd . " ssh_console";
                break;
            case 'tunel':
                $cmd = $this->remote_cmd . " tunnel";
                break;
            default:
                $this->myLogger->error("unknown resource type {$type}");
                return null;
        }
        switch ($name) {
            case "a127":
            case "b123":
            case "macs":
            case "remoto":
            case "host":
                $oper = (intval($timeout !== 0)) ? "Connect" : "Disconnect";
                $user = http_request("username", "s", "");
                $this->myLogger->info(
                    "FIREUP for user:{$user} operation:{$oper} action:{$type} from:{$_SERVER['REMOTE_ADDR']} to:{$name}/{$host} timeout:{$timeout}"
                );
                $cmd .= " {$name} {$host} {$_SERVER['REMOTE_ADDR']} {$timeout} {$user}";
                break;
            case "newvm":
                $this->myLogger->error("fireup in on-demand VM's not available yet");
                return null;
            default:
                $this->myLogger->error("unknown resource name {$name}");
                return null;
        }
        $res = $this->callMaestro($cmd);
        $args=strstr($cmd," ");
        $this->myLogger->trace("labo_sphere.sh '{$args}' returns {$res} ");
        // result es un string json
        $result = json_decode($res, true);
        if ($result === FALSE) return $res; // no se puede leer el json: retorna el error recibido
        if ($type == "console") {
            $result['success'] = true;
            return $result;
        }
        if ($type == "desktop") {
            // $this->launchProxy($result['host'],6100+str_replace("l","",$result['host']));
            $result['success'] = true;
            return $result;
        }
        if ($type == "tunel") {
            // PENDING: create iptable rule in firewall
            $result['success'] = true;
            return $result;
        }
        return $result;
    }

    public function serversInfo() {
        $cmd=$this->remote_dir."/comprueba_estado_web.sh";
        $this->myLogger->trace("Ejecutando callMaestro() cmd: {$cmd}");
        $res=$this->callMaestro($cmd,true);
        return $res;
    }

    public function loggingInfo() {
        return "PENDING: To be written";
    }
}
