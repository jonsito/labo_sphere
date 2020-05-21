<?php
/*
tools.php

Copyright  2013-2018 by Juan Antonio Martinez ( juansgaviota at gmail dot com )

This program is free software; you can redistribute it and/or modify it under the terms
of the GNU General Public License as published by the Free Software Foundation;
either version 2 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY;
without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

You should have received a copy of the GNU General Public License along with this program;
if not, write to the Free Software Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
*/

/**
 * Newer php 7.1 lacks of getAllHeaders() method.
 * so implement it
 */
if (!function_exists('getAllHeaders')) {
    function getAllHeaders() {
        $headers = array();
        foreach ($_SERVER as $name => $value) {
            if (substr($name, 0, 5) == 'HTTP_') {
                $headers[str_replace(' ', '-', ucwords(strtolower(str_replace('_', ' ', substr($name, 5)))))] = $value;
            }
        }
        return $headers;
    }
}

/**
 * Several utility functions
 */

/* boolval is only supported in PHP > 5.3 */
if( ! function_exists('boolval')) {
    function boolval($var)	{
        return !! $var;
    }
}

/* echo a gettext'd value */
if( ! function_exists('_e')) {
    function _e($var)	{
        echo _($var);
    }
}

/* convert to utf-8 a gettext'd value */
if( ! function_exists('_utf')) {
    function _utf($var)	{
        return html_entity_decode(_($var));
    }
}

/* semaphores does not exist in windozes so create */
if (!function_exists('sem_get')) {
    function sem_get($key) {
        return fopen(__DIR__ ."/../../logs/semaphore_{$key}.sem", 'w+');
    }
    function sem_acquire($sem_id) {
        return flock($sem_id, LOCK_EX | LOCK_NB);
    }
    function sem_release($sem_id) {
        return flock($sem_id, LOCK_UN);
    }
    function sem_remove($sem_id) {
        $meta_data = stream_get_meta_data($sem_id);
        $filename = $meta_data["uri"];
        fclose($sem_id);
        unlink($filename);
    }
}

/* poor's man implementation of ftok for windozes, required for semaphores */
if( !function_exists('ftok') ) {
    function ftok ($filePath, $projectId) {
        $fileStats = stat($filePath);
        if (!$fileStats) {
            return -1;
        }

        return sprintf('%u',
            ($fileStats['ino'] & 0xffff) | (($fileStats['dev'] & 0xff) << 16) | ((ord($projectId) & 0xff) << 24)
        );
    }
}

/* generate a pseudo-random string of provided length (def:16) */
function getRandomString($length = 16) {
    if (function_exists('random_bytes')) { // real random, secure numbers but only available after php >7.0
        return substr(str_replace(['+', '/', '='], '', base64_encode(random_bytes($length))), 0, $length);
    } else { // fallback when no PHP 7.0 available
        return substr(str_shuffle(str_repeat($x = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', ceil($length / strlen($x)))), 1, $length);
    }
}

/* check for positive, negative or zero */
function sign($n) {
    return ($n>0) - ($n<0);
}

function enterCriticalRegion($key) {
    $sem=sem_get($key);
    // this
    sem_acquire($sem);
    return $sem;
}

function leaveCriticalRegion($sem) {
    sem_release($sem);
}

/* add a new line in echo sentence */
function echon($str) { echo $str . "\n"; }

/* disable send compressed data to client from apache */
function disable_gzip() {
    @ini_set('zlib.output_compression', 'Off');
    @ini_set('output_buffering', 'Off');
    @ini_set('output_handler', '');
    @apache_setenv('no-gzip', 1);
}
// disable_gzip();

/**
 * Translate a number with arbitrary precission to fixed point decimal
 * @param {float} $number number to translate
 * @param {int} $prec number of decimals
 * @return {string} resulting number
 */
function number_format2($number,$prec) {
    // return round($number,$prec,PHP_ROUND_HALF_UP); // round
    // return round($number,$prec,PHP_ROUND_HALF_DOWN); // trunc. Fails due to half down not working as expected
    return bcmul(strval($number),1,$prec);
}

// convert a #rrggbb string to an array($r,$g,$b)
function hex2rgb($hex) {
    $hex = str_replace("#", "", $hex);

    if(strlen($hex) == 3) {
        $r = hexdec(substr($hex,0,1).substr($hex,0,1));
        $g = hexdec(substr($hex,1,1).substr($hex,1,1));
        $b = hexdec(substr($hex,2,1).substr($hex,2,1));
    } else {
        $r = hexdec(substr($hex,0,2));
        $g = hexdec(substr($hex,2,2));
        $b = hexdec(substr($hex,4,2));
    }
    $rgb = array($r, $g, $b);
    //return implode(",", $rgb); // returns the rgb values separated by commas
    return $rgb; // returns an array with the rgb values
}

function is_color($str) {
    if (preg_match('/^#[a-f0-9]{6}$/i', $str)) return true;
    if (preg_match('/^#[a-f0-9]{3}$/i', $str)) return true;
    return false;
}

// compile a range-comma (ie: "1,2,5-9" ) string to an array of values
function expand_range($range,$sep=",") {
    if (!is_string($range)) return array(); // empty
    $a=explode($sep,trim($range));
    $result=array();
    for ($n=0; $n<count ($a); $n++) {
        if (is_numeric($a[$n])) { $result[]= intval($a[$n]); continue;} // just add data
        if (preg_match('/^\d+-\d+$/',$a[$n])===FALSE) continue; // invalid syntax
        $r=explode("-",$a[$n]);
        $f=intval($r[0]);
        $t=intval($r[1]);
        if ($t<$f) continue; // invalid negative range specification
        for($i=$f;$i<=$t;$i++) $result[]=$i;
    }
    return $result;
}

// check if we are using HTTPS.
// notice this may fail on extrange servers when https is not by mean of port 443
function is_https(){
    if (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off') return true;
    return false;
}

/** convert an excel date format into unix epoch seconds */
function excelTimeToSeconds($exceldate) {
    return intval(floor(($exceldate - 25569) * 86400));
}

function normalize_license($license) {
    // remove every non alphanumeric chars
    $lic=preg_replace("/[^A-Za-z0-9 ]/", '', $license);
    // PENDING convert [0ABCD]xx to proper format (3 digits)
    return strtoupper($lic);
}

function normalize_filename($fname) {
    $fname=trim($fname);
    $fname=str_replace(" ","_",$fname);
    $fname=str_replace("/","",$fname);
    $fname=str_replace(".","",$fname);
    $fname=str_replace("+","",$fname);
    $fname=str_replace("_-_","_",$fname);
    return $fname;
}

function get_browser_name() {
    $user_agent=$_SERVER['HTTP_USER_AGENT'];
    if (strpos($user_agent, 'Opera') || strpos($user_agent, 'OPR/')) return 'Opera';
    elseif (strpos($user_agent, 'Edge')) return 'Edge';
    elseif (strpos($user_agent, 'Chrome')) return 'Chrome';
    elseif (strpos($user_agent, 'Safari')) return 'Safari';
    elseif (strpos($user_agent, 'Firefox')) return 'Firefox';
    elseif (strpos($user_agent, 'MSIE') || strpos($user_agent, 'Trident/7')) return 'Internet Explorer';
    return 'Other';
}

/**
 * Parse provided string and escape special chars to avoid SQL injection problems
 * NOTICE: THIS IS ONLY VALID FOR MYSQL "native escape mode" on UTF-8 encoding
 * DO NOT FORCE "ANSI" escape mode
 * @param {string} $str
 */
function escapeString($str) {
    $len=strlen($str);
    $res="";
    for($i=0;$i<$len;$i++) {
        switch($str[$i]) {
            case '\n': $a="\\"."n"; break;
            case '\r': $a="\\"."r"; break;
            case '"': $a="\\".'"'; break;
            case '\'': $a="\\"."'"; break;
            case '\b': $a="\\"."b"; break;
            case '\\': $a="\\"."\\"; break;
            case '%': $a="\\".'%'; break;
            // case '_': $a="\\"."_"; break;
            default: $a=$str[$i]; break;
        }
        $res .= $a;
    }
    return $res;
}

/**
 * capitalize first letter of every word utf8 strings
 * notice: ucwords() doesn't work with utf8
 * @param $str
 */
function toUpperCaseWords($str) {return mb_convert_case($str, MB_CASE_TITLE, "UTF-8"); }

/**
 * Parse an string and return matching boolean value
 * @param {string} $var  text to be evaluated
 * @return bool|string true, false,or same text if cannot decide
 */
function toBoolean($var) {
    if (is_null($var)) return false;
    if (is_bool($var)) return $var;
    if (is_string($var)) $var=strtolower(trim($var));
    $t=array (1,true,"1","t","true","on","s","si","sí","y","yes","ja","oui","da");
    if ( in_array($var,$t,true) ) return true;
    return false;
}

/**
 * @param {string} $var data to be checked
 * @return {bool|null} true:yes false:no null: not  a valid answer
 */
function parseYesNo($var) {
    if (is_null($var)) return false;
    if (is_bool($var)) return $var;
    if (is_string($var)) $var=strtolower(trim($var));
    $t=array (1,true,"x","1","t","true","on","s","si","sí","y","yes","ja","oui","da");
    if ( in_array($var,$t,true) ) return true;
    $f=array (0,false,"","0","f","false","off","n","no","ez","non","nein","niet");
    if ( in_array($var,$f,true) ) return false;
    // arriving here means neither true nor false valid items, so return nothing
    return null;
}

/**
 * convierte un string UTF-8 a la cadena ASCII mas parecida
 * @param $string
 */
function toASCII($string) {
    if (strpos($string = htmlentities($string, ENT_QUOTES, 'UTF-8'), '&') !== false) {
        $string = html_entity_decode(preg_replace('~&([a-z]{1,2})(?:acute|cedil|circ|grave|lig|orn|ring|slash|tilde|uml);~i', '$1', $string), ENT_QUOTES, 'UTF-8');
    }
    return $string;
}

// converts "YYYYmmdd_hhmm" to "YYYY-mm-dd hh:mm:00"
function toLongDateString($str) {
    // set "updated" to be the same date of version: yyyymmmdd_hhmm
    $year=substr($str,0,4);
    $month=substr($str,4,2);
    $day=substr($str,6,2);
    $hour=substr($str,9,2);
    $min=substr($str,11,2);
    return "{$year}-{$month}-{$day} {$hour}:{$min}:00";
}

/**
 * get a variable from _REQUEST array
 * @param {string} $name variable name
 * @param {string} $type default type (i,s,b)
 * @param {string} $def default value. may be null
 * @param {boolean} $esc true if variable should be MySQL escape'd to avoid SQL injection
 * @return {object} requested value (int,string,bool) or null if invalid type
 */
function http_request($name,$type,$def,$esc=true) {
    $a=$def;
    if (isset($_REQUEST[$name])) $a=$_REQUEST[$name];
    if ($a===null) return null;
    switch ($type) {
        case "s": if ($a===_('-- Search --') ) $a=""; // filter "search" in searchbox  ( should already be done in js side)
            if ($esc) return escapeString(strval($a));
            return strval($a);
        case "i": return intval($a);
        case "b":
            if ($a==="") return $def;
            return toBoolean($a);
        case "d":
        case "f": return floatval(str_replace("," ,"." ,$a));
    }
    do_log("request() invalid type:$type requested");
    return null;
}

/**
 * If requested name is present in http request retrieve it and add to provided array
 *
 * @param {array} $data
 * @param {string} $name variable name
 * @param {string} $type default type (i,s,b)
 * @param {string} $def default value. may be null
 * @param {boolean} $esc true if variable should be MySQL escape'd to avoid SQL injection
 * @return array with inserted data
 */
function testAndSet(&$data,$name,$type,$def,$esc=true) {
    if (isset($_REQUEST[$name])) $data[$name]=http_request($name,$type,$def,$esc);
    return $data;
}

/**
 * Generate a random password of "n" characters
 * @param {number} $chars Number of characters. Default to 8
 * @return {string} requested password
 */
function random_password($chars = 8) {
    $letters = 'abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890abcefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
    return substr(str_shuffle($letters), 0, $chars);
}

/**
 * Randomize array content
 * @param {array} $a array a reordenar
 * @return {array} shuffled array
 */
function aleatorio($a) { shuffle($a); return $a; }

/**
 * Generate a default client session name
 * generate string random(8)@client.ip.address
 * take care on ipv6 address by replace ':' with ';'
 * @return {string} default session name
 */
function getDefaultClientName($base) {
    $rnd = random_password(8);
    $addr = $_SERVER['REMOTE_ADDR'];
    return str_replace(":",".","{$base}_{$rnd}@{$addr}"); // filter ipv6 colon
}

/**
 * Remove recursively a directory
 * @param {string} $dir PATH TO remove
 * @return bool operation result
 */
function delTree($dir) {
    $files = array_diff(scandir($dir), array('.','..'));
    foreach ($files as $file) {
        (is_dir("$dir/$file")) ? delTree("$dir/$file") : unlink("$dir/$file");
    }
    return rmdir($dir);
}

/**
 * Return the substring starting after '$from' and ending before '$to'
 * @param {string} $str string to search into
 * @param {string} $from start tag
 * @param {string} $to end tag
 * @return {string} requested string or empty if not found
 */
function getInnerString($str,$from="",$to="") {
    $str = " ".$str;
    $ini = strpos($str,$from);
    if ($ini == 0) return "";
    $ini += strlen($from);
    $len = strpos($str,$to,$ini) - $ini;
    if ($len<=0) return "";
    return substr($str,$ini,$len);
}

function startsWith($haystack, $needle) {
    $length = strlen($needle);
    return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle) {
    $length = strlen($needle);
    if ($length == 0) {
        return true;
    }
    return (substr($haystack, -$length) === $needle);
}

// Function to check response time to http connect request
// also used as tcp ping test
function isNetworkAlive(){
    $starttime = microtime(true);
    $file      = @fsockopen ("185.129.248.76" /* www.agilitycontest.es */, 80, $errno, $errstr, 10);
    $stoptime  = microtime(true);
    if (!$file) return -1;  // Site is down
    fclose($file);
    $status = ($stoptime - $starttime) * 1000;
    return floor($status);
}

/**
 * Try to get a file from url
 * Depending on config try several methods
 *
 * @param {string} $url filename or URL  to retrieve
 */
function retrieveFileFromURL($url) {
    $scheme=parse_url($url,PHP_URL_SCHEME);
    if ($scheme !== "file") {
        // before continue check internet conectivity
        if (isNetworkAlive()<0) return FALSE;
    }
    // if enabled, use standard file_get_contents
    if (ini_get('allow_url_fopen') == true) {
        $res=@file_get_contents($url); // omit warning on faillure
        // on fail, try to use old way to retrieve data
        if ($res!==FALSE) return $res;
    }
    // if not enable, try curl
    if (function_exists('curl_init')) {
        $ch = curl_init();
        $timeout = 5;
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_CAINFO, __DIR__ . "/../../config/cacert.pem");
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1); // Set curl to return the data instead of printing it to the browser.
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // tell curl to allow redirects up to 5 jumps
        curl_setopt($ch, CURLOPT_IPRESOLVE, CURL_IPRESOLVE_V4); // try to fix some slowness issues in windozes
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT,$timeout);
        curl_setopt($ch, CURLOPT_URL, $url);
        $data = curl_exec($ch);
        curl_close($ch);
        return $data;
    }
    // arriving here means error
    return FALSE;
}

/**
 * Try to locate icon in the filesystem
 * Analyze provided icon name. If provides path, verify and use it
 * On invalid path or not provided,search into iconpath
 * @param $name (icon path or name )
 * @return $string full path name to load image from (server side)
 */
function getIconPath($name) {
    static $iconPathTable = array(); // prepare array on first call
    $name=basename($name); // to avoid sniffing extract name from path and force use own iconpaths
    $iconpath=array(
        __DIR__. "/../images", // standard club icon location
        __DIR__. "/../images/icons", // standard club icon location
        __DIR__. "/../lib/jquery-easyui-1.4.2/themes/icons", // library app logos
    );
    // if logo already in cache return it
    if (array_key_exists("$name",$iconPathTable)) return $iconPathTable["$name"];
    // else iterate paths to find logo
    foreach ($iconpath as $path) {
        if (!file_exists("{$path}/{$name}")) continue;
        $iconPathTable["$name"]="{$path}/{$name}";
        return "{$path}/{$name}";
    }
    // arriving here means not found. Use enterprise logo :-)
    return __DIR__."/../images/dit_logo.png";
}

/**
 * Create a temporary file and return their name
 * @param {string} $path Directory where file should be created
 * @param {string} $prefix File base name
 * @param {string} $suffix File extension
 * @return string fill path name
 */
function tempnam_sfx($path, $prefix="tmp_",$suffix="") {
    do	{
        $file = $path."/".$prefix.mt_rand().$suffix;
        if ($suffix!=="") $file=$file.".".$suffix;
        $fp = @fopen($file, 'x');
    }
    while(!$fp);
    fclose($fp);
    return $file;
}

?>

