<?php
class Configuration {
    /*
     * directory path where public and private rsa keys reside
     * must be readable by "apache" user
     * But MUST NOT be able to retrieve from web browser
     * By default choose default home dir for apache user
     */
    // for Fedora
    static $ssh_keypath="/usr/share/httpd/.ssh";
    static $ldap_credentials="/usr/share/httpd/.ssh/ldap_config.php";
    // for Ubuntu
    // static $ssh_keypath="/var/www/.ssh";
    // static $ldap_credentials="/var/www/.ssh/ldap_config.php";

    /*
     * ldap_credentials.php must be a php file with these contents:
     * <?php
     * define("LDAP_HOST","ldap-ng.lab.dit.upm.es");
     * define("LDAP_SERVER","ldaps://ldap-ng.lab.dit.upm.es");
     * define("LDAP_PORT",636);
     * define("LDAP_VERSION",3);
     * define("LDAP_AUTHDN","ou=Usuarios,dc=lab,dc=dit,dc=upm,dc=es");
     * define("LDAP_QUERYDN","cn=ldap-ng,dc=lab,dc=dit,dc=upm,dc=es");
     * define("LDAP_QUERYPW","<clean_passwd_comes_here>");
     * define("ADMIN_USERS","comma,separated,list,of,users,allowed,to,enter,in,admin,pages");
     * define("DEBUG_USER","debug"); // used to skip LDAP auth. must be set to "" on deployment
     * ?>
     *  MUST be owned by apache user, with 400 permissions and not accesible from outside the server
    */

    /*
     * Lista de servidores de maquinas virtuales VirtualBox
     * formato usuario@maquina
     * debe permitir el acceso sin password por ssh (authorized keys)
     * al usuario "apache" del servidor donde se ejecuta esta aplicacion
     */
    static $vbox_vms = array(
        "Local VBox Server" => "jantonio@localhost",
        "Remote VB Server 1" => "jantonio@pepino.local"
    );

    /*
     * Lista de servidores de maquinas virtuales VMWare
     * formato usuario@maquina
     * debe permitir el acceso sin password por ssh (authorized keys)
     * al usuario "apache" del servidor donde se ejecuta esta aplicacion
     */
    static $vmware_vms = array();

    /*
     * Lista de equipos Mac-OSX del A-127-4
     */
    static $desktop_macs = array(
        "MACs A-127-4" => "macs"
    );

    /*
     * Lista de equipos fisicos por zonas del laboratorio
     * La lista de maquinas se obtiene consultando a maestro3
     */
    static $desktop_pcs = array(
        "Lab. B-123-1" => "b123_1",
        "Lab. B-123-2" => "b123_2",
        "Lab. A-127-4" => "a127_4",
        "Lab. A-127-3" => "a127_3",
        "Lab. A-127-2" => "a127_2"
    );

    /*
     * Lista de clientes fisicos/virtuales del labo que no estan
     * fisicamente en el laboratorio
     * la lista se obtiene desde maestro por ssh
     */
    static $extra_pcs = array(
        "Despachos y Acc. Remoto" => "extra"
    );

    /*
     * Lista de regletas de alimentacion inteligentes
     */
    static $powerip = array(
        "Lab B-123" => "b123",
        "Lab A-127" => "a127"
    );

    /**
     * Servidores del laboratorio
     * Version web del "comprueba_estado.sh" de maestro3
     */
    static $servers = array(
        "Servidor Web labo" => "cdc@www.lab.dit.upm.es",
        "Maestro" => "cdc@maestro3.lab.dit.upm.es",
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
            "Equipos Mac-OSX" => array("MacOSXClientHandler", Configuration::$desktop_macs),
            "PC's del laboratorio" => array("DesktopClientHandler", Configuration::$desktop_pcs),
            "Equipos adicionales" => array("DesktopClientHandler", Configuration::$extra_pcs),
            "Servidores Laboratorio" => array("ServerClientHandler", Configuration::$servers),
            "Regletas PowerIP" => array("PowerIPClientHandler", Configuration::$powerip),
        );
    }
}
?>