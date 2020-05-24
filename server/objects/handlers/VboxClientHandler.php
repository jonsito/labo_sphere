<?php
require_once(__DIR__."/../View.php");
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

    /**
     * obtiene el estado del servidor actual y de todos los subnodos disponibles
     * Si un nodo no estaba presente crea y lo pone con id=0
     * Si un nodo ya no esta, lo devuelve con status "erased"
     * @param $id
     * @param $name
     * @param $children
     * @return array con el estado de los nodos
     */
    function groupStatus($id,$name,$children) {
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
            array_push($result,array("id"=>$id,"name"=>$name,"status"=>'Off'));
            // y marcamos todas las maquinas recibidas como "desconocido"
            foreach($vhostList as $host) {
                if ($host==='BEGIN') continue;
                if ($host==='END') continue;
                list($vid,$vname,$status)=explode(":",$host);
                array_push($result,array("vid"=>$id,"vname"=>$name,"status"=>'???'));
            }
            return $result;
        }
        // si llegamos aqui, el servidor de maquinas virtuales está activo.

        // obtenemos datos del servidor
        $ip=gethostbyname($serverHost);
        stream_set_blocking($fp, true);
        $line=preg_replace("/.*:[\t]/","",trim(fgets($fp)));
        fclose($fp);
        array_push($result,array('id'=>$id,'name'=>$name,'ip'=>$ip,'status'=>'On','comments'=>$line));
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

    function hostStatus($id,$vm) {
        $command="/usr/bin/VBoxManage guestproperty get {$vm} /VirtualBox/GuestInfo/Net/0/V4/IP";
        $a=explode("@",$this->location);
        $fp=$this->ssh_exec($a[0],$a[1],$command);
        if(!$fp) return array('id'=>$id,'name'=>$vm,'ip'=>'','status'=>'Off','actions'=>'','comments'=>'','children'=>array());
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
        return array('id'=>$id,'name'=>$vm,'ip'=>$ip,'status'=>$status);
    }

    function destroy($vm) {
        return true;
    }

    function enumerate() {
        return $this->enumerateRunning("vms",$this->location);
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