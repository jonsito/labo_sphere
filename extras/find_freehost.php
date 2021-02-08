<?php

/*
 * Utilidad para encontrar y asignar equipos libres en el labo,
 * teniendo en cuenta equipos "excluded" y reservas de puestos
 */

function doLog($msg) {
    echo $msg;
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
}
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
