<?php


class Action {
    protected $config;
    protected $servicios;
    protected $name;
    protected $level; // 1:server, 2:group, 3:host
    protected $parent;
    protected $handler;

    function __construct($name,$parent,$level) {
        $this->name=$name;
        $this->parent=$parent;
        $this->config=new Config();
        $this->servicios=$this->config->getServices();
        // ahora buscamos la clase a instanciar
        $hname=$parent;
        if($level==3) $hname=$name;

        // find class handler
        $classHandler="";
        foreach ($this->servicios as $serviceName => $serviceData) {
            $services=$serviceData[1];
            foreach($services as $sName =>$item) {
                if($sName===$hname) {
                    $classHandler=$serviceData[0];
                    break 2;
                }
            }
        }
        $this->handler=ClientHandler::getInstance($classHandler,$name);
    }
    function start($level) {
        if ($this->handler==null) return "start(): Cannot find handler for service {$this->parent}";
        if ($this->level==1) return $this->handler->serverStart($this->name);
        if ($this->level==2) return $this->handler->groupStart($this->name);
        if ($this->level==3) return $this->handler->hostStart($this->name);
        return "start():: invalid host level:{$level} provided for host {$this->name}";
    }

    function stop($level) {
        if ($this->handler==null) return "stop(): Cannot find handler for service {$this->parent}";
        if ($this->level==1) return $this->handler->serverStop($this->name);
        if ($this->level==2) return $this->handler->groupStop($this->name);
        if ($this->level==3) return $this->handler->hostStop($this->name);
        return "stop():: invalid host level:{$level} provided for host {$this->name}";
    }

    function status($level) {
        if ($this->handler==null) return "status(): Cannot find handler for service {$this->parent}";
        if ($this->level==1) return $this->handler->serverStatus($this->name,0);
        if ($this->level==2) return $this->handler->groupStatus($this->name,0);
        if ($this->level==3) return $this->handler->hostStatus($this->name,0);
        return "status():: invalid host level:{$level} provided for host {$this->name}";
    }
    function console($level) {
        if ($this->handler==null) return "console(): Cannot find handler for service {$this->parent}";
        if ($this->level==1) return $this->handler->serverConsole($this->name);
        if ($this->level==2) return $this->handler->groupConsole($this->name);
        if ($this->level==3) return $this->handler->hostConsole($this->name);
        return "console():: invalid host level:{$level} provided for host {$this->name}";
    }
}