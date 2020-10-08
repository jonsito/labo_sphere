<?php
require_once(__DIR__."/../View.php");
class VboxClientHandler extends ClientHandler {

    function hostStart($vm) {
        // if ($this->isRunning($vm)) return ""; // no real need to check running status
        $command="/usr/bin/VBoxManage startvm '{$vm}' --type headless >/dev/null 2>&1";
        $a=explode("@",$this->location);
        $res=$this->ssh_exec_noreturn($a[0],$a[1],$command);
        if (!$res) return "Failed on start virtual machine '{$vm}'";
        return "";
    }
    function groupStart($name) {
        // PENDING: Implement groupStart() method.
        return "";
    }
    function serverStart($name) {
        // PENDING: Implement serverStart() method.
        return "";
    }

    function hostStop($vm) {
        // if (!$this->isRunning($vm))  return ""; // no real need to check alive status
        /* PENDING: Windows needs the power button pressed multiple times for it to register, so detect machine type */
        $command="/usr/bin/VBoxManage controlvm '{$vm}' acpipowerbutton >/dev/null 2>&1";
        $a=explode("@",$this->location);
        $res=$this->ssh_exec_noreturn($a[0],$a[1],$command);
        if (!$res) return "Failed on stop virtual machine '{$vm}'";
        return "";
    }

    function groupStop($name) {
        // PENDING: Implement groupStop() method.
        return "";
    }
    function serverStop($name) {
        // PENDING: Implement serverStop() method. WARNING: this method affects wm server
        return "";
    }

    // reboot web.
    function hostRestart($name){ $this->hostStop($name); $this->hostStart($name); return ""; }
    function groupRestart($name) { $this->groupStop($name); $this->groupStart($name);return ""; }
    function serverRestart($name) { $this->serverStop($name); $this->serverStart($name); return ""; }

    function hostPause($vm) {
        if (!$this->isRunning($vm))  return true;
        if ($this->isRunning($vm)) return "";
        $command="/usr/bin/VBoxManage controlvm '{$vm}' pause >/dev/null 2>&1";
        $a=explode("@",$this->location);
        $res=$this->ssh_exec_noreturn($a[0],$a[1],$command);
        if (!$res) return "Failed on pause virtual machine '{$vm}'";
        return "";
    }
    function groupPause($name) {
        // PENDING: Implement groupPause() method.
        return "";
    }
    // serverPause is handled on parent class

    function hostResume($vm) {
        $command="/usr/bin/VBoxManage controlvm '{$vm}' resume >/dev/null 2>&1";
        $a=explode("@",$this->location);
        $res=$this->ssh_exec_noreturn($a[0],$a[1],$command);
        if (!$res) return "Failed on pause virtual machine '{$vm}'";
        return "";
    }
    function groupResume($name) {
        // PENDING: Implement groupResume() method.
        return "";
    }
    // serverResume is handled on parent class

    function hostDestroy($vm) {
        // PENDING. WARN handle with care
        return true;
    }
    function groupDestroy($name) {
        // PENDING: Implement groupDestroy() method.
        return true;
    }
    // serverDestroy is handled on parent class

    // groupConsole is handled in parent class
    function serverConsole($name) {
        // PENDING: Implement serverConsole() method.
    }

    function hostStatus($name,$id=0) {
        $command="/usr/bin/VBoxManage guestproperty get '{$name}' /VirtualBox/GuestInfo/Net/0/V4/IP";
        $a=explode("@",$this->location);
        $fp=$this->ssh_exec($a[0],$a[1],$command);
        if(!$fp) return array('id'=>$id,'name'=>$name,'ip'=>'','status'=>'Off','server'=>'','users'=>'','load'=>'','meminfo'=>'','children'=>array());
        $ip="";
        $status="Off";
        stream_set_blocking($fp, true);
        while ($line = trim(fgets($fp))) {
            $vmname = substr($line, 1, strpos($line, " ", 1)-1);
            if ( strpos($line,"No value") === FALSE ) {
                $status="On";
                $ip=str_replace("Value: ","",$line);
            }
        }
        fclose($fp);
        return array('id'=>$id,'name'=>$vmname,'ip'=>$ip,'status'=>$status);
    }

    /**
     * obtiene el estado del servidor actual y de todos los subnodos disponibles
     * Si un nodo no estaba presente crea y lo pone con id=0
     * Si un nodo ya no esta, lo devuelve con status "erased"
     * @param $id
     * @param $name
     * @param $children
     * @return array con el estado de los nodos
     */
    function groupStatus($name,$id=0,$children="BEGIN,END") {
        $result=array();
        // obtenemos usuario y direccion del servidor
        $userhost=Configuration::$vbox_vms[$name];
        list($serverUser,$serverHost)=explode("@",$userhost);
        // generamos lista de clientes actual
        $vhostList=explode(",",$children);
        // fase 1 comprobamos el estado del servidor
        $command="/usr/bin/lsb_release -d";
        $fp=$this->ssh_exec($serverUser,$serverHost,$command);
        if (!$fp) {
            // marcamos el servidor de maquinas virtuales como off
            array_push($result,array("id"=>$id,"name"=>$name,"status"=>'Off',"server"=>'-',"users"=>'-',"load"=>'',"meminfo"=>''));
            // y marcamos todas las maquinas recibidas como "desconocido"
            foreach($vhostList as $host) {
                if ($host==='BEGIN') continue;
                if ($host==='END') continue;
                list($vid,$vname,$status)=explode(":",$host);
                array_push($result,array("vid"=>$id,"vname"=>$name,"status"=>'???',"server"=>'-',"users"=>'-',"load"=>'',"meminfo"=>''));
            }
            return $result;
        }
        // si llegamos aqui, el servidor de maquinas virtuales está activo.

        // obtenemos datos del servidor
        $ip=gethostbyname($serverHost);
        stream_set_blocking($fp, true);
        $line=preg_replace("/.*:[\t]/","",trim(fgets($fp)));
        fclose($fp);
        array_push($result,array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'On','comments'=>$line,"server"=>'-',"users"=>'-',"load"=>'',"meminfo"=>''));
        // y ahora obtenemos datos de las maquinas que estan corriendo en dicho servidor

        // primero generamos la lista por defecto, poniendo todos a 'Old'
        // usamos un array asociativo para facilitar las busquedas
        $data=array();
        foreach($vhostList as $host) {
            if ($host==='BEGIN') continue;
            if ($host==='END') continue;
            list($vid,$vname,$status)=explode(":",$host);
            $data[$vname]=array("id"=>$vid,"name"=>$vname,"status"=>'Old');
        }

        // ahora preguntamos al servidor la lista de maquinas
        // completamos la lista por defecto, poniendo a "Off" las encontradas
        // si hay alguna nueva, la creamos con id=0 y status a Off
        $vcurrent=$this->enumerateRunning("vms",$userhost);
        foreach($vcurrent as $host) {
            if(array_key_exists($host,$data)) $data[$host]['status']='Off';
            else $data[$host]=View::defaultEntry($host,2,'New');
        }
        // finalmente vemos que maquinas estan activas
        // y volvemos a repasar la lista anterior, poniendo a "On" las encontradas
        $vrunning=$this->enumerateRunning("runningvms",$userhost);
        foreach($vrunning as $host) { $data[$host]['status']='On'; }

        //hora de retornar el resultado :-)
        // convertimos el array asociativo en array normal quitando las claves y lo retornamos
        foreach($data as $host => $value) array_push($result,$value);
        return $result;
    }

    function serverStatus($name, $id = 0) {
        // PENDING: Implement serverStatus() method.
        return "";
    }

    function enumerate() {
        return $this->enumerateRunning("vms",$this->location);
    }

    private function isRunning($name) {
        $list=$this->enumerateRunning("runningvms",$this->location);
        foreach ($list as $machine) if ($machine==$name) return true;
        return false;
    }

    private function enumerateRunning($mode,$location) {
        $res=array();
        $command="/usr/bin/VBoxManage list {$mode}";
        $a=explode("@",$location);
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