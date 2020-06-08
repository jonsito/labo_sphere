<?php


class ResourceHandler {
    protected $user;
    protected $password;

    function __construct($user,$pass) {
        $this->user=$user;
        $this->password=$pass;
    }

    public function findResource($name) {
        // PENDING: real work of find, deploy and start a free resource
        switch ($name) {
            case "laboA": return array('success'=>true,'data'=>"l133");
            case "laboB": return array('success'=>true,'data'=>"l110");
            case "virtual": return array('success'=>true,'data'=>"l051");
            case "newvm": return null; // not available yet
        }
        // arriving here means invalid resource name
        return null;
    }
}