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
        $serviceID=0; /* ids from 0 to 9 */
        foreach ($this->servicios as $serviceName => $serviceData) {
            // serviceData = (handler,serverlist)
            $service=array('id'=>$serviceID,'name'=>$serviceName,'ip'=>'','status'=>'','actions'=>'','children'=>array());
            // para cada servicio obtenemos la lista de servidores
            $serverID=100*$serviceID;
            $handler=$serviceData[0];
            $servers=$serviceData[1];
            foreach($servers as $serverName => $serverData) {
                // vemos si $data corresponde a una macro o a una maquina
                // las maquinas vienen precedidas por user@ ; esto es, el usuario con que se hara ssh
                // las macros no tienen @
                $ip="";
                if (strpos($serverData,"@")!==FALSE) {
                    $ip=preg_replace("/.*@/","",$serverData);
                }
                $server=array('id'=>$serverID,'name'=>$serverName,'ip'=>$ip,'status'=>'','actions'=>'','children'=>array());
                // para cada server buscamos los hosts
                $handler=ClientHandler::getInstance($handler,$serverData);
                $hostID=1000*$serverID;
                foreach($handler->enumerate() as $hostName) {
                    $host=$handler->status($hostName);
                    // add host to server tree
                    array_push($server['children'],$host);
                    $hostID++;
                }
                // ad server to service
                array_push($service['children'],$server);
                $serverID++;
            }
            // add service to main tree
            array_push($data,$service);
            $serviceID++;
        }
        return $data;
    }
}