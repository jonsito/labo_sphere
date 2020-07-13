<?php
// retrieve from configuration ldap_credentials file
require_once(__DIR__."/../../config/config.php");
require_once(__DIR__."/../logging.php");
require_once(Configuration::$ldap_credentials);

class AuthLDAP {
    var $users;
    var $myLogger;

    function __construct () {
        $this->users=array();
        $this->myLogger=new Logger("AuthLDAP",LEVEL_TRACE);
    }

    function getUserData($user) {
        // initialize user data
        $this->users[$user]=array();
        $this->users[$user]['userid']=-1;
        $this->users[$user]['groupid']=-1;
        $this->users[$user]['groups']="";

        // connect to ldap server
        $conn= ldap_connect(LDAP_SERVER,LDAP_PORT);
        if (!$conn) return false;
        if (! ldap_set_option($conn,LDAP_OPT_PROTOCOL_VERSION,LDAP_VERSION) ) {
            ldap_close($conn);
            return false;
        }
        $r=ldap_bind($conn,LDAP_QUERYDN,LDAP_QUERYPW);
        if (!$r) { // bind error
            ldap_close($conn);
            return false;
        }

        // query user data to ldap server
        $filter="(uid=".$user.")";
        $query=array('uid','uidNumber','gidNumber');
        $result=ldap_search($conn,LDAP_AUTHDN,$filter,$query);
        if(!$result) { // error en consulta
            ldap_close($conn);
            return false;
        }
        // retrieve userid and gid
        $entry=ldap_first_entry($conn,$result);
        if (!$entry) { // no entries
            ldap_close($conn);
            return false;
        }
        // buscamos los datos
        $attrs=ldap_get_attributes($conn,$entry);
        // rellenamos la tabla de resultados
        $this->users[$user]['userid']=$attrs["uidNumber"][0];
        $this->users[$user]['groupid']=$attrs["gidNumber"][0];

        // ahora buscamos la lista de grupos
        // TODO
        ldap_close($conn);
        return true;
    }

    function login($user,$password="") {
        if (defined(DEBUG_USER)) {
            if ($user===DEBUG_USER) return true;
        }
        $conn= ldap_connect(LDAP_SERVER,LDAP_PORT);
        if (!$conn) {
            $this->myLogger->error("LDAP Connect failed for user '{$user}'");
            return false;
        }
        if (! ldap_set_option($conn,LDAP_OPT_PROTOCOL_VERSION,LDAP_VERSION) ) {
            ldap_close($conn);
            return false;
        }
        if(!ctype_graph($user)) return false; // no valid login
        // Intentamos hacer bind con el user y el pass dados
        $dn="uid=".$user.",".LDAP_AUTHDN;
        $res= @ldap_bind($conn,$dn,$password);
        ldap_close($conn);
        if (!$res) {
            $this->myLogger->error("Authentication failed for user: '{$user}'");
            return false;
        }
        $this->myLogger->info("Authentication success for user: '{$user}'");
        return true;
    }

    function getUserID($user) {
        if (!array_key_exists($user,$this->users)) $this->getUserData($user);
        return $this->users[$user]['userid'];
    }

    function getGroupID($user) {
        if (!array_key_exists($user,$this->users)) $this->getUserData($user);
        return $this->users[$user]['groupid'];
    }

    function getGroups($user) {
        if (!array_key_exists($user,$this->users)) $this->getUserData($user);
        return $this->users[$user]['groups'];
    }

}
