<?php

/*
 * Utilidad para encontrar y asignar equipos libres en el labo,
 * teniendo en cuenta equipos "excluded" y reservas de puestos
 */

function doLog($msg) {
    $logFile="/var/log/labo_sphere.log";
    file_put_contents($logFile,"{$msg}\n",FILE_APPEND);
}

class DBConnection {
    static $conn=null; // singleton
    var $errormsg="";

    /*
    * Abre conexión con bbdd.lab.dit.upm.es
    */
    function getConnection() {
        $host="bbdd.lab.dit.upm.es";
        $port=3306;
        $db="reservas";
        $user="reservas";
        if (DBConnection::$conn!==null) return DBConnection::$conn;
        $conn=mysqli_init();
        if (!$conn) {
            $this->error_msg=sprintf("mysqli_init(): %s\n",$conn->error);
            doLog($this->errormsg);
            return null;
        }
        // retrieve db password from www.lab.dit.upm.es notice that ssh adds an ending '\n'
        $pass=shell_exec("ssh www.lab.dit.upm.es base64 -d /var/www/htpasswd/bbdd_reservas.pwd");
        if (is_null($pass)) {
            doLog("cannot retrieve db passwd from wwww.lab.dit.upm.es");
            return null;
        }
        // open connection
        if (! mysqli_real_connect($conn,$host, $user, trim($pass), $db, $port,null,MYSQLI_CLIENT_SSL)) {
            $this->errormsg=sprintf("mysql_real_connect(): %s\n",$conn->error);
            doLog($this->errormsg);
            return null;
        }
        DBConnection::$conn=$conn;
        return $conn;
    }

    /**
     * Obtiene la lista de reservas en una fecha/duracion determinada del usuario indicado
     * @param int $timestamp (empty defaults "this hour")
     * @param int $duration (empty defaults to 1 hour)
     * @param string $user (empty means "any" user)
     * @param int $inc 0: provided user is (0)excluded (1)included
     * @return array of reserved hosts
     */
    function getReserved($timestamp=0,$nturnos=1,$user="",$inc=1) {
        $querystr = "SELECT * FROM reservas WHERE ";
        if ( ($user!=="") && ($inc===0) )$querystr .= "(login<>'{$user}') AND \n";
        if ( ($user!=="") && ($inc!==0) )$querystr .= "(login='{$user}') AND \n";
        // mktime( hour:minute:second:month:date:year). Notice G,n,j to avoid initial zeroes
        if ($timestamp==0) $timestamp=mktime(date("G"),0,0,date("n"),date("j"),date("Y") );
        else $timestamp=$timestamp - ($timestamp%3600); // ajustamos a hora exacta
        $querystr .= " ( \n (fechaturno={$timestamp})\n ";
        for ($n=$nturnos;$n>0;$n--) {
            $ft= $timestamp+3600*$n;
            $mft= $timestamp-3600*$n;
            $querystr .= "OR ((fechaturno={$ft}) AND ({$nturnos}>{$n})) \n"; // reservas posteriores
            $querystr .= "OR ((fechaturno={$mft}) AND (duracion>{$n})) \n"; // reservas anteriores
        }
        $querystr .= ");"; // closing parenthesis

        // ok. now call database
        $conn=$this->getConnection();
        if ($conn==null) {
            doLog("Cannot retrieve database connection");
            return array();
        }
        $rs=$conn->query($querystr);
        // doLog("Query string is:\n".$querystr);
        if (!$rs) {
            doLog("Query()::error in query '{$querystr}': ".$conn->error);
            return array();
        }
        // iterate rows. notice that bbdd is too old so cannot use mysqli_fetch_all()
        $res= array();
        while ($row= $rs->fetch_array(MYSQLI_ASSOC)) array_push($res,$row['puesto']);
        $rs->free();
        return $res;
    }
} // class

/* just for debugging
$login='mirella.adazo';
$dbc=new DBConnection();
$list=$dbc->getReserved(1584968400,1);
echo "Puestos reservados:\n".json_encode($list)."\n";
$list=$dbc->getReserved(1584968400,1,$login,0);
echo "Puestos NO reservados por {$login}:\n".json_encode($list)."\n";
$list=$dbc->getReserved(1584968400,1,$login,1);
echo "Puestos reservados por {$login}:\n".json_encode($list)."\n";
*/

function find_freeHost($zone,$duration,$user="") {
    $dbc=new DBConnection();
    $currentHour=$timestamp=mktime(date("G"),0,0,date("n"),date("j"),date("Y") );
    // obtenemos la lista de equipos de la zona
    $items=shell_exec("/home/operador/administracion/servicios_ubuntu-18.04/lista_maquinas {$zone}");
    $list=explode(" ",trim($items));
    // doLog("\noriginal zone {$zone}\n".json_encode($list));
    // le quitamos la lista "exclude"
    $items=shell_exec("/home/operador/administracion/servicios_ubuntu-18.04/lista_maquinas exclude");
    $invalid=array();
    if (trim($items)!=="") $invalid=explode(" ",trim($items)); // may be empty
    // doLog("\noriginal exclude\n".json_encode($invalid));

    $list=array_diff($list,$invalid);
    // doLog("\noriginal minus exclude:\n".json_encode($list));

    // componemos tres listas:
    // - la lista de reservados por el usuario
    $userList=array();
    if($user!=="") { // si no hay usuario definido, no buscamos nada en la base de datos :-)
        $userList=$dbc->getReserved($currentHour,$duration,$user,1);
        if ($userList===null) {
            doLog("Cannot retrieve list of hosts reserved by user '{$user}'");
            return "";
        }
    }
    shuffle($userList);
    // doLog("\nuserlist:\n".json_encode($userList));
    // - la lista de reservados por otros
    $otherList=$dbc->getReserved($currentHour,$duration,$user,0);
    if ($otherList===null) {
        doLog("Cannot retrieve list of hosts reserved by other people than '{$user}'");
        return "";
    }
    shuffle($otherList);
    // doLog("\nOtherlist:\n".json_encode($otherList));
    // - la lista de equipos sin reservar
    $freeList=array_diff($list,$userList,$otherList);
    shuffle($freeList);
    // doLog("\nFreelist:\n".json_encode($freeList));
    // re-ordenamos segun el criterio:
    // $userOn, $userOff, $userBusy; $freeOn, $freeOff, $otherOff, $freeBusy, $otherOn
    // (notese que el otherOn/otherOff esta invertido, para coger siempre primero uno reservado que no se este usando

    // para ello analizamos el fichero de estado de equipos, y componemos el array de estados
    $statusFile=file("/home/operador/administracion/servicios_ubuntu-18.04/estado_clientes.log");
    $state=array();
    foreach ($statusFile as $item) {
        $a=explode(" ",$item);
        $host=substr($a[0],7);
        $st=strtolower(substr($a[1],6));
        if ($a[3]!=="Users:-") $st="busy";
        $state[$host]=$st;
    }
    // doLog("\nState:\n".json_encode($state));
    // y empezamos a ordenar.
    $list=array();
    $towakeup=array();
    $wkf=0;
    foreach ($userList as $item) if ($state[$item]==="up") {
        array_push($list,$item); // user ON
        if ($wkf==1) { $wkf=0; array_push($towakeup,$item); } //add first host to to_send_wakeup_list
    }
    $wkf=1;
    foreach ($userList as $item) if ($state[$item]==="down") {
        array_push($list,$item); // user OFF
        if ($wkf==1) { $wkf=0; array_push($towakeup,$item); } //add first host to to_send_wakeup_list
    }
    foreach ($userList as $item) if ($state[$item]==="busy") array_push($list,$item); // user BUSY
    foreach ($freeList as $item) if ($state[$item]==="up") array_push($list,$item); // free on
    $wkf=1;
    foreach ($freeList as $item) if ($state[$item]==="down") {
        array_push($list,$item); // free off
        if ($wkf==1) { $wkf=0; array_push($towakeup,$item); } //add first host to to_send_wakeup_list
    }
    $wkf=1;
    foreach ($otherList as $item) if ($state[$item]==="down") {
        array_push($list,$item); // other off
        if ($wkf==1) { $wkf=0; array_push($towakeup,$item); } //add first host to to_send_wakeup_list
    }
    foreach ($freeList as $item) if ($state[$item]==="busy") array_push($list,$item); // free busy
    foreach ($otherList as $item) if ($state[$item]==="up") array_push($list,$item); // other up
    foreach ($otherList as $item) if ($state[$item]==="busy") array_push($list,$item); // other busy
    // cogemos como seleccionado el primero de la lista
    // doLog("\nToWakeUp:\n".json_encode($towakeup));
    // doLog("\nFinalList:\n".json_encode($list));
    $host=$list[0];
    $delay=0;
    // mandamos la orden de encender a los tres equipos
    foreach ($towakeup as $item) system("/usr/local/bin/wakeup.sh -b {$item}");
    // retornamos el host seleccionado y si estaba encendido o apagado
    return array("host" => $host, "delay" =>$delay);
}

// invocacion:
// php -f path/to/findFreeHost zone duration user

// preliminary checks
if ($argc<3) {
    doLog("find_freehost.php usage: zone|host nturnos user");
}
$turnos= parseInt($argv[2]);
if ($turnos>10) $turnos=$turnos/3600; // if timeout is given in seconds, translate to hours
// ponemos lock
$sem = sem_get(12345,1,0666);
sem_acquire($sem);
// invocamos funcion
if (!array_key_exists(3,$argv)) {
    doLog("find_freehost.php Call args {$argv[1]} {$argv[2]}");
    $result=find_freeHost($argv[1],$turnos);
} else {
    doLog("find_freehost.php Call args {$argv[1]} {$argv[2]} {$argv[3]}");
    $result=find_freeHost($argv[1],$turnos,$argv[3]);
}
doLog("\nfind_freehost.php: Selected host: ".json_encode($result)."\n");
echo $result['host'];
// liberamos semaforo
sem_release($sem);
// sem_remove($sem);
