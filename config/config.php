<?php
class Configuration {
    /*
     * Lista de servidores de maquinas virtuales VirtualBox
     * formato usuario@maquina
     * debe permitir el acceso sin password por ssh (authorized keys)
     * al usuario "apache" del servidor donde se ejecuta esta aplicacion
     */
    static $vbox_vms = array(
        "VM Server 1" => "jantonio@localhost",
        "VM Server 2" => "root@osito.local"
    );

    /*
     * Lista de servidores de maquinas virtuales VMWare
     * formato usuario@maquina
     * debe permitir el acceso sin password por ssh (authorized keys)
     * al usuario "apache" del servidor donde se ejecuta esta aplicacion
     */
    static $vmware_vms = array();

    /*
     * Lista de equipos fisicos por zonas del laboratorio
     * La lista de maquinas se obtiene consultando a maestro3
     */
    static $desktop_pcs = array(
        "Lab. B-123-1" => "b123_1",
        "Lab. B-123-2" => "b123_2",
        "Lab. A-127-4" => "a127_4",
        "Lab. A-127-3" => "a127_4",
        "Lab. A-127-2" => "a127_4"
    );

    /*
     * Lista de clientes fisicos/virtuales del labo que no estan
     * fisicamente en el laboratorio
     * la lista se obtiene desde maestro por ssh
     */
    static $extra_pcs = array(
        "Despachos" => "extra"
    );

    /**
     * Servidores del laboratorio
     * Version web del "comprueba_estado.sh" de maestro3
     */
    static $servers = array(
        "Servidor Web labo" => "cdc@www.lab.dit.upm.es",
        "maestro3" => "cdc@maestro3.lab.dit.upm.es",
        "Binario 1" => "cdc@binario1.lab.dit.upm.es",
        "Binario 2" => "cdc@binario2.lab.dit.upm.es",
        "Binario 3" => "cdc@binario3.lab.dit.upm.es",
        "Binario 4" => "cdc@binario4.lab.dit.upm.es",
        "Home de alumnos" => "cdc@recipiente10.lab.dit.upm.es",
    );

    /*
     * Arbol principal de maquinas y servicios
     * normalmente no sera necesario tocar aqui
     */
    static function getServicios()  {
        return array(
            "Servidores Virtualbox" => array("VboxClientHandler", Configuration::$vbox_vms),
            "Servidores VMWare" => array("VMWareClientHandler", Configuration::$vmware_vms),
            "PC's del laboratorio" => array("DesktopClientHandler", Configuration::$desktop_pcs),
            "Equipos adicionales" => array("DesktopClientHandler", Configuration::$extra_pcs),
            "Servidores Laboratorio" => array("ServerClientHandler", Configuration::$servers)
        );
    }
}
?>