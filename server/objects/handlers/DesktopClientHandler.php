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
        } else if ($this->location=='a127_2') { // 221-254
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
     * get running status, ip address, machine type and so
     * @param {string} $name tree node name
     * @param {integer} $id tree node id. On id!=0 return treegred status, on id==0 return dialog host info
     * @return array contents on evaluated node
     */
    function hostStatus($name,$id=0){
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
    // start/wakeup web
    function start($name){

    }

    // stop/shutdown web
    function stop($name){

    }

    // pause/suspend web ( use with care )
    function pause($name){

    }

    // resume paused/suspended web
    function resume($name){

    }

    // remove web
    function destroy($name){

    }

    function serverStatus($name, $id = 0)    { return ""; }

    function hostStart($name) {
        // PENDING: Implement hostStart() method.
    }
    function groupStart($name) { return ""; }
    function serverStart($name) { return ""; }

    function hostStop($name) {
        // PENDING: Implement hostStop() method.
    }
    function groupStop($name) { return ""; }
    function serverStop($name) { return ""; }

    function hostPause($name) { return "Cannot pause physical host {$name}"; }
    function groupPause($name) { return ""; }
    // serverPause is handled in parent class

    function hostResume($name) { return "Cannot resume physical host {$name}"; }
    function groupResume($name) { return ""; }
    // serverResume is handled in parent class

    function hostDestroy($name) { return "Cannot destroy physical host {$name}"; }
    function groupDestroy($name) { return ""; }
    // serverDestroy is handled in parent class

    function hostConsole($name) {
        // PENDING: Implement hostConsole() method.
    }
    // groupConsole is handled in parent class
    function serverConsole($name) { return ""; }
}