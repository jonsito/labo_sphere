<?php
require_once(__DIR__."/../logging.php");
require_once(__DIR__."/../../config/config.php");
require_once(__DIR__."/NetworkInterfaces.php");

class ResourceHandler {
    const remote_cmd="/home/operador/administracion/servicios_ubuntu-18.04/tools/labo_sphere.sh";
    protected $user;
    protected $password;
    protected $myLogger;

    function __construct($user,$pass) {
        $this->user=$user;
        $this->password=$pass;
        $this->myLogger=new Logger("ResourceHandler",LEVEL_TRACE);
    }

    /*
     * Call maestro to fire up required resources to launch ssh/vpn/tunnel
     * Notice that provided ssh key should be restricted in host maestro3
     * to execute only script
     */
    protected function callMaestro($command) {
        $host="maestro3.lab.dit.upm.es";
        $connection = @ssh2_connect($host, 22, array('hostkey'=>'ssh-rsa'));
        if (!$connection) {
            $this->myLogger->notice("Cannot ssh connect to server {$host}");
            return null;
        }
        if ( ! ssh2_auth_pubkey_file($connection, "root",
            Configuration::$ssh_keypath.'/id_rsa.pub',
            Configuration::$ssh_keypath.'/id_rsa') ) {
            $this->myLogger->notice("Cannot ssh auth with server {$host}");
            return null;
        }
        $fp= ssh2_exec($connection,$command);
        if (!$fp) $this->myLogger->error("Execution of ssh {$command} on maestro.lab failed");
        stream_set_blocking($fp, true);
        $line=trim(fgets($fp)); // these functions only return host:port json string
        fclose($fp);
        return $line;
    }

    function launchProxy($host,$port=0) {
        // as clients launch vnc-on-demand host port is allways 5900
        // if port==0 local port is 6100+host. No problem when there is already a live connection
        // to that host:
        if ($port==0) {
            $port=6100+ intval( str_replace("l","",$host));
        }
        // ahora lanzamos el proxy
        $cmd="netstat -ant | grep -q {$port} || websockify --daemon ".  // go to background
            "--idle-timeout 300 ". // exit after 5 minutes idle
            "--cert /etc/ssl/certs/acceso.lab.dit.upm.es.certificado.pem ".
            "--key /etc/ssl/private/acceso.lab.dit.upm.es.llave.pem ".
            "--ssl-only {$port} {$host}.lab.dit.upm.es:5900 ";
        @exec($cmd,$output,$result);
        if ($result!==0) {
            $msg="Error launching web socket proxy\nCommand is:{$cmd} ";
            $this->myLogger->error($msg);
            return $msg;
        }
        return array("success"=>true,"host"=>$host,"port"=>$port);
    }

    // find of type("desktop","console","tunel") on resource name ("laboA","laboB","virtual","macs","newvm") or given host
    public function fireUp($name,$type,$host="none") {
        // $this->myLogger->enter("findResourece($name)");
        // PENDING: real work of find, deploy and start a free resource
        $result=array('success'=>true);
        $cmd=self::remote_cmd;
        switch($type) {
            case 'desktop':
                $cmd = self::remote_cmd." vnc_console ";
                break;
            case 'console':
                $cmd = self::remote_cmd." ssh_console";
                break;
            case 'tunel':
                $cmd = self::remote_cmd." tunnel";
                break;
            default:
                $this->myLogger->error("unknown resource type {$type}");
                return  null;
        }
        switch ($name) {
            case "laboA":
            case "laboB":
            case "macs":
            case "virtual":
            case "host":
                $cmd.=" {$name} {$host}";
                break;
            case "newvm":
                $this->myLogger->error("fireup in on-demand VM's not available yet");
                return  null;
            default:
                $this->myLogger->error("unknown resource name {$name}");
                return  null;
        }
        $res=$this->callMaestro($cmd);
        $this->myLogger->trace("callMaestro '{$cmd}' returns {$res} ");
        // result es un string json
        $result=json_decode($res,true);
        if ($result===FALSE) return $res; // no se puede leer el json: retorna el error recibido
        if ($type=="console") {
            $result['success']=true; return $result;
        }
        if ($type=="desktop") {
            // $this->launchProxy($result['host'],6100+str_replace("l","",$result['host']));
            $result['success']=true; return $result;
        }
        if ($type=="tunel") {
            // PENDING: create iptable rule in firewall
            $result['success']=true; return $result;
        }
        return $result;
    }
}