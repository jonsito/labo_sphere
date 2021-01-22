<?php


class Action {
    protected $config;
    protected $servicios;
    protected $name;
    protected $parent;
    protected $handler;

    function __construct($name,$parent,$level) {
        $this->name=$name;
        $this->parent=$parent;
        $this->config=new Config();
        $this->servicios=$this->config->getServices();
        // ahora buscamos la clase a instanciar
        $hname=$name;
        if($level==3) $hname=$parent;

        // find class handler
        $classHandler="";
        foreach ($this->servicios as $serviceName => $serviceData) {
            $services=$serviceData[1];
            foreach($services as $sName =>$item) {
                if($sName===$hname) {
                    $classHandler=$serviceData[0];
                    $this->handler=ClientHandler::getInstance($classHandler,$item);
                    return;
                }
            }
        }

    }

    function start($level) {
        if ($this->handler==null) return "start(): Cannot find handler for service {$this->parent}";
        if ($level==1) return $this->handler->serverStart($this->name);
        if ($level==2) return $this->handler->groupStart($this->name);
        if ($level==3) return $this->handler->hostStart($this->name);
        return "start():: invalid host level:{$level} provided for host {$this->name}";
    }

    function stop($level) {
        if ($this->handler==null) return "stop(): Cannot find handler for service {$this->parent}";
        if ($level==1) return $this->handler->serverStop($this->name);
        if ($level==2) return $this->handler->groupStop($this->name);
        if ($level==3) return $this->handler->hostStop($this->name);
        return "stop():: invalid host level:{$level} provided for host {$this->name}";
    }
    function restart($level) {
        if ($this->handler==null) return "stop(): Cannot find handler for service {$this->parent}";
        if ($level==1) return $this->handler->serverRestart($this->name);
        if ($level==2) return $this->handler->groupRestart($this->name);
        if ($level==3) return $this->handler->hostRestart($this->name);
        return "stop():: invalid host level:{$level} provided for host {$this->name}";
    }

    function status($level) {
        if ($this->handler==null) return "status(): Cannot find handler for service {$this->parent}";
        if ($level==1) return $this->handler->serverStatus($this->name,0);
        if ($level==2) return $this->handler->groupStatus($this->name,0);
        if ($level==3) return $this->handler->hostStatus($this->name,0);
        return "status():: invalid host level:{$level} provided for host {$this->name}";
    }
    function console($level) {
        if ($this->handler==null) return "console(): Cannot find handler for service {$this->parent}";
        if ($level==1) return $this->handler->serverConsole($this->name);
        if ($level==2) return $this->handler->groupConsole($this->name);
        if ($level==3) return $this->handler->hostConsole($this->name);
        return "console():: invalid host level:{$level} provided for host {$this->name}";
    }
    function kill($level) {
        if ($level!==3) return "kill():: invalid host level:{$level} provided for host {$this->name}";
        return $this->handler->hostKill($this->name);
    }
}