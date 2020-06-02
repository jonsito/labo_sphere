<?php


class Action {
    protected $name;
    protected $parent;

    function __construct($name,$parent) {
        $this->name=$name;
        $this->parent=$parent;
    }

    function start() { return ""; }
    function group_start() { return ""; }
    function stop() { return ""; }
    function group_stop() { return ""; }
    function status() { return ""; }
    function group_status() { return ""; }
    function console() { return ""; }
    function group_console() { return ""; }
}