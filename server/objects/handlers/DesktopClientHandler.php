<?php
class DesktopClientHandler extends ClientHandler {

    // list clients at current location
    function enumerate(){
        $res=array();
        if ($this->location=='b123_1') { // l056-l100
            for($i=56;$i<=100;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='b123_2') { // l101-l124
            for($i=101;$i<=124;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='macs') { // l134-l148
            for($i=134;$i<=148;$i++) array_push($res,sprintf("l%03d",$i));
        } else if ($this->location=='a127_4') { // 113,149-186.
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

    // get running status, ip address, machine type and so
    function status($name,$id=0){
        $command="/usr/bin/who";
        $ip=gethostbyname("{$name}.lab.dit.upm.es");
        $fp=$this->ssh_exec('cdc',$ip,$command);
        if(!$fp) return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'Off','actions'=>'','comments'=>'','children'=>array());
        $status="On";
        stream_set_blocking($fp, true);
        $line=trim(fgets($fp));
        fclose($fp);
        if ($line!=="") $status="Busy";
        return array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>$status,'actions'=>'','comments'=>'','children'=>array());
    }
}