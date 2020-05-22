<?php
require_once(__DIR__."/../../config/config.php");

class Config {
    var $servicios;

    function __construct() {
        $this->servicios=Configuration::getServicios();
    }

    function getService($service) {
        if (array_key_exists($service,$this->servicios)) return $this->servicios[$service];
        return null;
    }

    function getServices() {
        return $this->servicios;
    }
}