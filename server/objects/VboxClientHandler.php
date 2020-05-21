<?php

class VboxClientHandler extends ClientHandler {

    function start($vm) {
        if ($this->status($vm)['online']) return true;
        $args = "";
        if ($vm["vncport"] > 0) $args .= " -n -m " . $vm["vncport"];
        system("nohup /usr/bin/VBoxHeadless -s '" . $vm["name"] . "'" . $args . " > /dev/null 2>&1 &");
        return true;
    }

    function stop($vm) {
        if (!$this->status($vm)['online'])  return true;
        /* Windows needs the power button pressed multiple times for it to register */
        $count = 1;
        if ($vm["type"] == "windows") $count = 3;
        for ($i = 0; $i < $count; $i++) {
            system("sudo -u jantonio /usr/bin/VBoxManage controlvm '" . $vm["name"] . "' acpipowerbutton > /dev/null 2>&1");
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

    function status($vm) {
        $fp = popen("sudo -u jantonio /usr/bin/VBoxManage list runningvms", "r");
        if(!$fp) return null;
        while ($line = trim(fgets($fp))) {
            $name = substr($line, 1, strpos($line, "\"", 1)-1);
            if ($name == $vm["name"]) {
                pclose($fp);
                // PENDING: retrieve type, IP, and so
                return array('name'=>$name,'status'=>'On');
            }
        }
        pclose($fp);
        return null;
    }

    function destroy($vm) {
        return true;
    }

    function enumerate($running) {
        $r=($running==true)?"runningvms":"vms";
        $command="sudo -u jantonio /usr/bin/VBoxManage list {$r}";
        $fp = popen($command, "r");
        if (!$fp) return null;
        $res=array();
        while ($line = trim(fgets($fp))) {
            $res[] = substr($line, 1, strpos($line, "\"", 1)-1);
        }
        pclose($fp);
        return $res;
    }
}