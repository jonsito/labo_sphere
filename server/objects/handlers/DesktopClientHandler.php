<?php
class DesktopClientHandler extends ClientHandler {

    protected $tablanumeros=array();
    var $maxThreads = 10;
    var $child = 0;

    public function __construct($location) {
        parent::__construct($location);
        $f=file(__DIR__."/../../../config/maquinas_labo.txt",FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($f as $line) {
            list($host,$ip,$ether)=explode(" ",$line);
            $this->tablanumeros[$host]=array("ip"=>$ip,"ether"=>$ether);
        }
        /*
        pcntl_signal(SIGCHLD, function ($signo) {
            global $child;
            if ($signo === SIGCLD) {
                while (($pid = pcntl_wait($signo, WNOHANG)) > 0) {
                    $signal = pcntl_wexitstatus($signo);
                    $child--;
                }
            }
        });
        */
    }

    // list clients at current location
    function enumerate(){
        $res=array();
        if ($this->location=='b123_1') { // l056-l100
            for($i=56;$i<=100;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='b123_2') { // l101-l124
            for($i=101;$i<=124;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='macs') { // l134-l148
            for($i=134;$i<=148;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='a127_4') { // 133,149-186.
            array_push($res,"l133");
            for($i=149;$i<=186;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='a127_3') { // 187-220
            for($i=187;$i<=220;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='a127_3') { // 221-254
            for($i=221;$i<=254;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='extra') { // equipos de los despachos
            foreach(array(50,51,52,53,54,55,123,125,126) as $item) array_push($res,sprintf("l%03d",$item));
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
    function groupStatus($id, $name, $children) {
        $result=array();
        $hostList=explode(",",$children);
        foreach($hostList as $host) {
            if ($host==="BEGIN") continue;
            if ($host==="END") continue;
            list($id,$name,$status) = explode(":",$host);
            /*
            $this->execute_in_parallel($result,$status,$id,$name);
            while ($this->child != 0) { sleep(3); }
            */
            // get host status and add only when return data shows changed elements
            $data=$this->hostStatus($id,$name);
            if($data['status']!==$status) array_push($result,$data);
        }
        return $result;
    }

    private function execute_in_parallel(&$result,$status,$id,$name) {
        while ($this->child >= $this->maxThreads) { sleep(1); }
        $this->child++;
        $pid = pcntl_fork();
        if ($pid==0) { // child
            $data=$this->hostStatus($id,$name);
            if($data['status']!==$status) array_push($result,$data);
            exit(0);
        }
    }

    /**
     * get running status, ip address, machine type and so
     * @param {integer} $id tree node id
     * @param {string} $name tree node name
     * @return array contents on evaluated node
     */
    function hostStatus($id,$name){
        $command="/usr/bin/who";
        $ip=$this->tablanumeros[$name]['ip'];
        /*
        if (array_key_exists($name,$this->tablanumeros)) $ip=$this->tablanumeros[$name]['ip'];
        else $ip=gethostbyname("{$name}.lab.dit.upm.es");
        */
        $fp=$this->ssh_exec('root',$ip,$command);
        if(!$fp) return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'Off');
        $status="On";
        stream_set_blocking($fp, true);
        $line=trim(fgets($fp));
        fclose($fp);
        if ($line!=="") $status="Busy";
        return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>$status);
    }
    // start/wakeup client
    function start($name){

    }

    // stop/shutdown client
    function stop($name){

    }

    // pause/suspend client ( use with care )
    function pause($name){

    }

    // resume paused/suspended client
    function resume($name){

    }

    // remove client
    function destroy($name){

    }
}