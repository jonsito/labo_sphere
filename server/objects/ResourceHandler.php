<?php
require_once(__DIR__."/../logging.php");
require_once(__DIR__."/../../config/config.php");
require_once(__DIR__."/NetworkInterfaces.php");

class ResourceHandler
{
    const remote_dir = "/home/operador/administracion/servicios_ubuntu-18.04/tools";
    const remote_cmd = "/home/operador/administracion/servicios_ubuntu-18.04/tools/labo_sphere.sh";
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
     * Notice that provided ssh key should be restricted in host maestro3
     * to execute only script
     */
    protected function callMaestro($command)
    {
        $host = "maestro3.lab.dit.upm.es";
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
        $line = trim(fgets($fp)); // these functions only return host:port json string
        fclose($fp);
        return $line;
    }

    // find of type("desktop","console","tunel") on resource name ("laboA","laboB","virtual","macs","newvm") or given host
    public function fireUp($name, $type, $host = "none", $timeout = 0)
    {
        // $this->myLogger->enter("findResourece($name)");
        // PENDING: real work of find, deploy and start a free resource
        $result = array('success' => true);
        switch ($type) {
            case 'desktop':
                $cmd = self::remote_cmd . " vnc_console ";
                break;
            case 'console':
                $cmd = self::remote_cmd . " ssh_console";
                break;
            case 'tunel':
                $cmd = self::remote_cmd . " tunnel";
                break;
            default:
                $this->myLogger->error("unknown resource type {$type}");
                return null;
        }
        switch ($name) {
            case "laboA":
            case "laboB":
            case "macs":
            case "virtual":
            case "host":
                $oper = (intval($timeout !== 0)) ? "Connect" : "Disconnect";
                $user = http_request("username", "s", "");
                $this->myLogger->info(
                    "FIREUP for user:{$user} operation:{$oper} action:{$type} from:{$_SERVER['REMOTE_ADDR']} to:{$name}/{$host} timeout:{$timeout}"
                );
                $cmd .= " {$name} {$host} {$_SERVER['REMOTE_ADDR']} {$timeout}";
                break;
            case "newvm":
                $this->myLogger->error("fireup in on-demand VM's not available yet");
                return null;
            default:
                $this->myLogger->error("unknown resource name {$name}");
                return null;
        }
        $res = $this->callMaestro($cmd);
        $this->myLogger->trace("callMaestro '{$cmd}' returns {$res} ");
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
        $res=$this->callMaestro($this.self::remote_dir."/comprueba_estado_web.sh");
    }

    public function loggingInfo() {
    }
}