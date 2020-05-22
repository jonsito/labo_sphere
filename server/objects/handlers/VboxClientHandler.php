<?php

class VboxClientHandler extends ClientHandler {

    function start($vm) {
        if ($this->status($vm)['online']) return true;
        $args = "";
        if ($vm["vncport"] > 0) $args .= " -n -m " . $vm["vncport"];
        system("{$this->ssh_cmd} {$this->location} nohup /usr/bin/VBoxHeadless -s '{$vm["name"]}' {$args} > /dev/null 2>&1 &");
        return true;
    }

    function stop($vm) {
        if (!$this->status($vm)['online'])  return true;
        /* Windows needs the power button pressed multiple times for it to register */
        $count = 1;
        if ($vm["type"] == "windows") $count = 3;
        for ($i = 0; $i < $count; $i++) {
            system("{$this->ssh_cmd} {$this->location} /usr/bin/VBoxManage controlvm '" . $vm["name"] . "' acpipowerbutton > /dev/null 2>&1");
            sleep(10);
        }
        return true;
    }

    function pause($vm) {
        if (!$this->status($vm)['online'])  return true;
        system("sudo -u jantonio /usr/bin/VBoxManage controlvm '" . $vm["name"] . "' savestate");
        return true;
    }

    function resume($vm) {
        if ($this->stop($vm) == false) return false;
        return $this->start($vm);
    }

    function status($vm,$id=0) {
        $command="usr/bin/VBoxManage guestproperty get {$vm} /VirtualBox/GuestInfo/Net/0/V4/IP";
        $a=explode("@",$this->location);
        $fp=$this->ssh_exec($a[0],$a[1],$command);
        if(!$fp) return array();
        $ip="";
        $status="Off";
        stream_set_blocking($fp, true);
        while ($line = trim(fgets($fp))) {
            $name = substr($line, 1, strpos($line, " ", 1)-1);
            if ( strpos($line,"No value") === FALSE ) {
                $status="On";
                $ip=str_replace("Value: ","",$line);
            }
        }
        fclose($fp);
        return array('id'=>$id,'name'=>$vm,'ip'=>$ip,'status'=>$status,'actions'=>'','children'=>array());
    }

    function destroy($vm) {
        return true;
    }

    function enumerate() {
        $res=array();
        $command="/usr/bin/VBoxManage list vms";
        $a=explode("@",$this->location);
        $fp=$this->ssh_exec($a[0],$a[1],$command);
        if (!$fp) return $res;
        stream_set_blocking($fp, true);
        while ($line = trim(fgets($fp))) {
            array_push($res,substr($line, 1, strpos($line, "\"", 1)-1));
        }
        fclose($fp);
        return $res;
    }
}