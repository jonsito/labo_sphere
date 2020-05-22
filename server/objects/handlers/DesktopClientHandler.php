<?php
class DesktopClientHandler extends ClientHandler {

    // list clients at current location
    function enumerate(){
        $res=array();
        if ($this->location=='b123_1') { // l056-l100
            for($i=56;$i<=57;$i++) array_push($res,sprintf("l%03d",$i));
        }
        if ($this->location=='b123_2') { // l101-l124
            for($i=101;$i<=105;$i++) array_push($res,sprintf("l%03d",$i));
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