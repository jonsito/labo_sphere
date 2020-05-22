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
    function enumerate() {
        $data=array();
        // obtenemos la raiz de servicios
        $index=1; /* ids from 1 to 9 !dont use zero! */
        foreach ($this->servicios as $serviceName => $serviceData) {
            // serviceData = (handler,serverlist)
            $service=array('id'=>$index++,'name'=>$serviceName,'ip'=>'','status'=>'','actions'=>'','children'=>array());
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
                $server=$handler->serverStatus($serverName,$index++);
                if($server['ip']==="") $server['ip']=$ip; // fill if no provided ip
                // para cada server buscamos los hosts
                $hosts=$handler->enumerate();
                foreach($hosts as $hostName) {
                    set_time_limit(30);
                    $host=$handler->status($hostName,$index++);
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