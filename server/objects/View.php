<?php
require_once(__DIR__."/Config.php");
require_once(__DIR__."/handlers/ClientHandler.php");

class View {
    var $config;
    var $servicios;

    function __construct() {
        $this->config=new Config();
        $this->servicios=$this->config->getServices();
    }

    function defaultEntry($name,$level,$status='???') {
        static $index=1;
        return array('id'=>$index++,'level'=>$level,'name'=>$name,'ip'=>'','status'=>$status,'actions'=>'','children'=>array());
    }

    function checkGroup($id,$name,$children) {
        // find class handler
        $classHandler="";
        foreach ($this->servicios as $serviceName => $serviceData) {
            $services=$serviceData[1];
            foreach($services as $serviceName =>$item) {
                if($serviceName===$name) {
                    $classHandler=$serviceData[0];
                    break 2;
                }
            }
        }
        if ($classHandler==="") {
            return array("success"=>false,"errorMsg"=>"Cannot find handler for  {$name}");
        }
        $handler=ClientHandler::getInstance($classHandler,$name);
        return $handler->groupStatus($id,$name,$children);
    }

    function enumerate() {
        $data=array();
        // obtenemos la raiz de servicios
        $index=1; /* ids from 1 to 9 !dont use zero! */
        foreach ($this->servicios as $serviceName => $serviceData) {
            // serviceData = (handler,serverlist)
            $service=$this->defaultEntry($serviceName,1,'');
            // para cada servicio obtenemos la lista de servidores
            $className=$serviceData[0];
            $servers=$serviceData[1];
            foreach($servers as $serverName => $serverData) {
                // vemos si $data corresponde a una macro o a una maquina
                // las maquinas vienen precedidas por user@ ; esto es, el usuario con que se hara ssh
                // las macros no tienen @
                $ip="";
                if (strpos($serverData,"@")!==FALSE) {
                    $ip=preg_replace("/.*@/","",$serverData);
                }
                $handler=ClientHandler::getInstance($className,$serverData);
                $server=$this->defaultEntry($serverName,2,'');
                $server['ip']=$ip;
                // para cada server buscamos los hosts
                $hosts=$handler->enumerate();
                foreach($hosts as $hostName) {
                    $host=$this->defaultEntry($hostName,3);
                    // add host to server tree
                    array_push($server['children'],$host);
                }
                // ad server to service
                array_push($service['children'],$server);
            }
            // add service to main tree
            array_push($data,$service);
        }
        return $data;
    }
}