<?php
/**
 * Clase para enumerar los interfaces de red del servidor
 */
class NetworkInterfaces {
    var $osName;
    var $interfaces;

    function __construct() {
        $this->osName = strtoupper(PHP_OS);
    }

    // Function to check response time to http connect request
    // also used as tcp ping test
    static function isHostAlive($host){
        $starttime = microtime(true);
        $file      = @fsockopen ($host, 22, $errno, $errstr, 3);
        $stoptime  = microtime(true);
        if (!$file) return -1000 * ($stoptime - $starttime);  // Site is down
        fclose($file);
        return 1000 * ($stoptime - $starttime);
    }

    /**
     * Ping to requested host with provided ( or defaulted ) parameters
     * @return int Latency, in ms.
     */
    function ping_address($host,$ttl=64,$timeout=1) {
        $latency = false;
        // this is to protect data injection in "exec" command
        $ttl = escapeshellcmd($ttl);
        $timeout = escapeshellcmd($timeout);
        $host = escapeshellcmd($host);
        // prepare ping command depending on OS
        switch ($this->osName) {
            case 'WINDOWS':
            case 'WIN32':
            case 'WINNT':
                // -n = number of pings; -i = ttl; -w = timeout (in milliseconds).
                $exec_string = 'ping -n 1 -i ' . $ttl . ' -w ' . ($timeout * 1000) . ' ' . $host;
                break;
            case 'LINUX':
                // -n = numeric output; -c = number of pings; -t = ttl; -W = timeout
                $exec_string = 'ping -n -c 1 -t ' . $ttl . ' -W ' . $timeout . ' ' . $host . ' 2>&1';
                break;
            case 'DARWIN':
                // -n = numeric output; -c = number of pings; -m = ttl; -t = timeout.
                $exec_string = 'ping -n -c 1 -m ' . $ttl . ' -t ' . $timeout . ' ' . $host;
                break;
            default     : break;
        }
        exec($exec_string, $output, $return);
        // Strip empty lines and reorder the indexes from 0 (to make results more
        // uniform across OS versions).
        $this->commandOutput = implode($output, '');
        $output = array_values(array_filter($output));
        // If the result line in the output is not empty, parse it.
        if (!empty($output[1])) {
            // Search for a 'time' value in the result line.
            $response = preg_match("/time(?:=|<)(?<time>[\.0-9]+)(?:|\s)ms/", $output[1], $matches);
            // If there's a result and it's greater than 0, return the latency.
            if ($response > 0 && isset($matches['time'])) {
                $latency = round($matches['time']);
            }
        }
        return $latency;
    }

    function get_interfaces() {
        if ($this->interfaces){
            return $this->interfaces;
        }
        $ipPattern="";
        $ipRes="";
        switch ($this->osName) {
            case 'WINDOWS':
            case 'WIN32':
            case 'WINNT': $ipRes = shell_exec('ipconfig');
                $ipPattern = '/IPv4[^:]+: ([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/';
                // does not work: its i18 dependend, has some upper/lowercase issues and requires "/all" parameter
                // $macPattern = '/'._('Physical').'[^:]+: ([a-fA-F0-9]{2}-){5}[a-fA-F0-9]{2}/';
                break;
            case 'LINUX': $ipRes = shell_exec('/sbin/ifconfig');
                $ipPattern = '/inet ([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/';
                // $macPattern = '/ether ([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}/';
                break;
            case 'DARWIN': $ipRes = shell_exec('ifconfig'); // PENDING: revise
                $ipPattern = '/inet ([\d]{1,3}\.[\d]{1,3}\.[\d]{1,3}\.[\d]{1,3})/';
                // $macPattern = '/ether ([a-fA-F0-9]{2}:){5}[a-fA-F0-9]{2}/';
                break;
            default     : break;
        }
        if (preg_match_all($ipPattern, $ipRes,$matches)) {
            $this->interfaces = $matches[1];
            return $this->interfaces;
        }
        return array();
    }
}