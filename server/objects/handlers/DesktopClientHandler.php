<?php
class DesktopClientHandler extends ClientHandler {
    const MASTER_CMD="/home/operador/administracion/servicios_ubuntu-18.04/tools/labo_sphere.sh";
    const STATUS_FILE="/var/www/html/labo_sphere/logs/client_status.log";
    const MAQUINAS_LABO=__DIR__."/../../../config/maquinas_labo.txt";

    protected $tablanumeros=array();
    protected $status_table=array();

    public function __construct($location) {
        parent::__construct($location);
        $f=file(self::MAQUINAS_LABO,FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        $this->status_table=@file(self::STATUS_FILE,FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($f as $line) {
            list($host,$ip,$ether)=explode(" ",$line);
            $this->tablanumeros[$host]=array("ip"=>$ip,"ether"=>$ether);
        }
    }

    // list clients at current location
    function enumerate(){
        $res=array();
        if ($this->location=='b123_1') { // l056-l100
            for($i=56;$i<=100;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='b123_2') { // l101-l124
            for($i=101;$i<=125;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='macs') { // l134-l148
            for($i=134;$i<=148;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='a127_4') { // 133,149-186.
            array_push($res,"l133");
            for($i=149;$i<=186;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='a127_3') { // 187-220
            for($i=187;$i<=220;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='a127_2') { // 221-254
            for($i=221;$i<=254;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='extra') { // equipos de los despachos
            foreach(array(50,51,52,53,54,55,126,127,128) as $item) array_push($res,sprintf("l%03d",$item));
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
    private function hostStatus_old($name,$id=0) {
        // $command="/usr/bin/who";
        $command=self::MASTER_CMD." status '{$name}' >/dev/null 2>&1";
        $ip=$this->tablanumeros[$name]['ip'];
        /*
        if (array_key_exists($name,$this->tablanumeros)) $ip=$this->tablanumeros[$name]['ip'];
        else $ip=gethostbyname("{$name}.lab.dit.upm.es");
        */
        $fp=$this->ssh_exec('root',"maestro3.lab.dit.upm.es",$command);
        if(!$fp) return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'Off');
        $status="On";
        stream_set_blocking($fp, true);
        $line=trim(fgets($fp));
        fclose($fp);
        if ($line!=="") $status="Busy";
        return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>$status);
    }

    /**
     * get running status, ip address, machine type and so
     * @param {string} $name tree node name
     * @param {integer} $id tree node id. On id!=0 return treegred status, on id==0 return dialog host info
     * @return array contents on evaluated node
     */
    function hostStatus($name,$id=0) {
        $ip=$this->tablanumeros[$name]['ip'];
        if ($this->status_table===FALSE) return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'???');
        $status='???';
        foreach($this->status_table as $host) {
            // Client:l055 State:UP Server:binario1 Users:-
            if (strpos($host,"Client:{$name}")===FALSE) continue;
            if (strpos($host,"State:DOWN")!==FALSE) return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'Off');
            if (strpos($host,"Users:-")!==FALSE)
                return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'On'); // active, no users
            else return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'Busy'); // active, busy
        }
        // arriving here means that host is not in list, so fallback in older method
        return $this->hostStatus_old($name,$id);
    }

    function serverStatus($name, $id = 0)    { return ""; }

    function hostStart($name) {
        $command=self::MASTER_CMD." start '{$name}' >/dev/null 2>&1";
        // $command="/usr/local/bin/wakeup.sh '{$name}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root','maestro3.lab.dit.upm.es',$command);
        if (!$res) return "Failed on start physical host '{$name}'";
        return "";
    }
    function groupStart($name) { return ""; }
    function serverStart($name) { return ""; }

    function hostStop($name) {
        $command=self::MASTER_CMD." stop '{$name}' >/dev/null 2>&1";
        // $command="/usr/local/bin/apagamaq.sh '{$name}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root','maestro3.lab.dit.upm.es',$command);
        if (!$res) return "Failed on stop physical host '{$name}'";
        return "";
    }
    function groupStop($name) { return ""; }
    function serverStop($name) { return ""; }

    function hostRestart($name) {
        $command=self::MASTER_CMD." restart '{$name}' >/dev/null 2>&1";
        // $command="/usr/local/bin/apagamaq.sh --reboot '{$name}' >/dev/null 2>&1";
        $res=$this->ssh_exec_noreturn('root','maestro3.lab.dit.upm.es',$command);
        if (!$res) return "Failed on stop physical host '{$name}'";
        return "";
    }
    function groupRestart($name) { return ""; }
    function serverRestart($name) { return ""; }

    function hostPause($name) { return "Cannot pause physical host {$name}"; }
    function groupPause($name) { return ""; }
    // serverPause is handled in parent class

    function hostResume($name) { return "Cannot resume physical host {$name}"; }
    function groupResume($name) { return ""; }
    // serverResume is handled in parent class

    function hostDestroy($name) { return "Cannot destroy physical host {$name}"; }
    function groupDestroy($name) { return ""; }
    // serverDestroy is handled in parent class

    // hostConsole is handled in parent clase
    // groupConsole is handled in parent class
    function serverConsole($name) { return "There is no Server console for physical host {$name}"; }
}