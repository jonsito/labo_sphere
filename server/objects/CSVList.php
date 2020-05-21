<?php

/**
 * Class CSVList
 * Class to handle BEGIN,xxx,yyy,zzz,END Like string lists
 */
class CSVList {
    /**
     * Insert item (if not already present) at the end of a comma-separated list
     * @param {int} $item
     * @param {string} $list
     * @return {string} new list
     */
    function list_insert($item,$list='BEGIN,END') {
        $str = ",$item,";
        if (strpos($list,$str)!==false) return $list; // already present
        // componemos el tag que hay que insertar
        $myTag="$item,END";
        // y lo insertamos en lugar que corresponde ( al final )
        return str_replace ( "END", $myTag, $list );
    }

    /**
     * Remove item from comma-separated list
     * @param {int} $item
     * @param {string} $list
     * @return {string} new list
     */
    function list_remove($item,$list='BEGIN,END') {
        $str = ",$item,";
        return str_replace ( $str, ",", $list );
    }

    /**
     * Inserta un perro en el espacio indicado, sacandolo del sitio inicial
     * @param {integer} $from sitio inicial (dog ID)
     * @param {integer} $to sitio final
     * @param {integer} $where insertart "encima" (0) o "debajo" (1)
     * @param {string} $list
     * @return {string} new list
     */
    function list_move($from,$to,$where,$list='BEGIN,END') {
        if ($from==$to) return $list; // no need to change anything
        // extraemos "from" de donde este y lo guardamos
        $str = ",$from,";
        $list = str_replace ( $str , "," , $list );
        // insertamos 'from' encima o debajo de 'to' segun el flag 'where'
        $str1 = ",$to,";
        $str2 = ($where==0)? ",$from,$to," : ",$to,$from,";
        // retornamos el resultado
        return str_replace( $str1 , $str2 , $list );
    }

    /**
     * Tells if a item is included in list
     * @param {integer} $item
     * @param {string} $list
     * @return {bool} false or true ( found, notfound
     */
    function list_isMember($item,$list="BEGIN,END") {
        $str=",$item,";
        return (strpos($list,$str)===FALSE)?false:true;
    }

}