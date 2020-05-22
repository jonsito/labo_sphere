<?

class Config {
    var $servicios;

    function __construct() {
        include(__DIR__."/../../config/config.php");
        $this->servicios=$servicios;
    }

    function getService($service) {
        if (array_key_exists($service,$this->servicios)) return $this->servicios[$service];
        return null;
    }

    function getServices() {
        return $this->servicios;
    }
}