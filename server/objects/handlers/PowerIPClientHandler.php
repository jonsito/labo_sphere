<?php
class DesktopClientHandler extends ClientHandler {
    const MASTER_CMD="/home/operador/administracion/servicios_ubuntu-18.04/tools/labo_sphere.sh";
    const MAESTRO="maestro3.lab.dit.upm.es";

    protected $tablanumeros=array();
    protected $status_table=array();

    // list clients at current location
    function enumerate(){
        $res=array();
        if ($this->location=='b123') { // labo edificio B
            for($i=1;$i<=14;$i++) array_push($res,sprintf("powerip%d",$i));
        } else if ($this->location=='a127') { // l101-l124
            array_push($res,"powerip15"); // no existe, pero se pone para probar
        }
        return $res;
    }

    /**
     * comprueba el estado de los clientes
     * @param {integer} $id tree node id
     * @param {string} $name tree node name
     * @param {string} $children node children list BEGIN,ID:name:status,...,END
     * @return array datos de los clientes que cambian
     */
    function groupStatus($name, $id=0, $children="BEGIN,END") {
        $result=array();
        $hostList=explode(",",$children);
        foreach($hostList as $host) {
            if ($host==="BEGIN") continue;
            if ($host==="END") continue;
            list($id,$name,$status) = explode(":",$host);
            // get host status and add only when return data shows changed elements
            $data=$this->hostStatus($name,$id);
            if($data['status']!==$status) array_push($result,$data);
        }
        return $result;
    }

    /**
     * this routine is used as fallback when host status is not provided from maestro polling
     * @param string $name host name to check
     * @param int $id treegrid entry id or zero
     * @return array
     */
    function hostStatus($name,$id=0) {
        // $command="/usr/bin/who";
        $command=self::MASTER_CMD." status '{$name}' >/dev/null 2>&1";
        $ip=$this->tablanumeros[$name]['ip'];
        /*
        if (array_key_exists($name,$this->tablanumeros)) $ip=$this->tablanumeros[$name]['ip'];
        else $ip=gethostbyname("{$name}.lab.dit.upm.es");
        */
        $fp=$this->ssh_exec('root',self::MAESTRO,$command);
        if(!$fp) return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'Off');
        $status="On";
        stream_set_blocking($fp, true);
        $line=trim(fgets($fp));
        fclose($fp);
        if ($line!=="") $status="Busy";
        return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>$status);
    }

    function serverStatus($name, $id = 0)    { return ""; }

    // start: encender todos los interruptores del powerip indicado
    function hostStart($name) {
        $command=self::MASTER_CMD." start '{$name}' >/dev/null 2>&1";
        // $command="/usr/local/bin/wakeup.sh '{$name}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root',self::MAESTRO,$command);
        if (!$res) return "Failed on start physical host '{$name}'";
        return "";
    }
    // groupstart encender todos los interruptores de todos los powerip del labo indicado
    function groupStart($name){
        if (!array_key_exists($name,Configuration::$powerip)) {
            $this->myLogger->error("Invalid Desktop group name: {$name}");
            return "";
        }
        $group=Configuration::$powerip[$name];
        $command=self::MASTER_CMD." start '{$group}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root',self::MAESTRO,$command);
        if (!$res) return "Failed on start host group: '{$name}'";
        return "";
    }
    function serverStart($name) { return ""; }

    // shut down power on every switches for given powerip
    function hostStop($name) {
        $command=self::MASTER_CMD." stop '{$name}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root',self::MAESTRO,$command);
        if (!$res) return "Failed on stop physical host '{$name}'";
        return "";
    }

    // shut down power on every switches for every powerip in group
    function groupStop($name) {
        if (!array_key_exists($name,Configuration::$powerip)) {
            $this->myLogger->error("Invalid PowerIP group name: {$name}");
            return "";
        }
        $group=Configuration::$desktop_pcs[$name];
        $command=self::MASTER_CMD." stop '{$group}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root',self::MAESTRO,$command);
        if (!$res) return "Failed on stop host group: '{$name}'";
        return "";
    }
    function serverStop($name) { return ""; }

    // send off-delay-on sequence on given powerip host
    function hostRestart($name) {
        $command=self::MASTER_CMD." restart '{$name}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root',self::MAESTRO,$command);
        if (!$res) return "Failed on stop PowerIP '{$name}'";
        return "";
    }
    // send off-delay-on sequence on every powerip on provided group
    function groupRestart($name) {
        if (!array_key_exists($name,Configuration::$powerip)) {
            $this->myLogger->error("Invalid PowerIP group name: {$name}");
            return "";
        }
        $group=Configuration::$powerip[$name];
        $command=self::MASTER_CMD." restart '{$group}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root',self::MAESTRO,$command);
        if (!$res) return "Failed on restart PowerIP group: '{$name}'";
        return "";
    }
    function serverRestart($name) { return ""; }

    function hostPause($name) { return "Cannot pause PowerIP {$name}"; }
    function groupPause($name) { return "Cannot pause PowerIP group {$name}"; }
    // serverPause is handled in parent class

    function hostResume($name) { return "Cannot resume PowerIP {$name}"; }
    function groupResume($name) { return "Cannot resume PowerIP group {$name}"; }
    // serverResume is handled in parent class

    function hostDestroy($name) { return "Cannot destroy PowerIP {$name}"; }
    function groupDestroy($name) { return "Cannot destroy PowerIP group {$name}"; }
    // serverDestroy is handled in parent class

    // hostConsole is handled in parent clase
    // groupConsole is handled in parent class
    function serverConsole($name) { return "Pending open webconsole for PowerIP {$name}"; }
}