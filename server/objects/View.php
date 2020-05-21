<?php
require_once(__DIR__."/ClientHandler.php");
require_once(__DIR__."/VboxClientHandler.php");
require_once(__DIR__."/DesktopClientHandler.php");

class View {
    function enumerate() {
        $data=array(
            array( 'id'=>1,'name'=>'M&aacute;quinas Virtuales','ip'=>'','status'=>'','actions'=>'','children'=>array()),
            array( 'id'=>2,'name'=>'Lab. B-123-1','ip'=>'','status'=>'','actions'=>'','children'=>array()),
            array( 'id'=>3,'name'=>'Lab. B-123-2','ip'=>'','status'=>'','actions'=>'','children'=>array()),
            array( 'id'=>4,'name'=>'Lab. A-127-4','ip'=>'','status'=>'','actions'=>'','children'=>array()),
            array( 'id'=>5,'name'=>'Lab. A-127-3','ip'=>'','status'=>'','actions'=>'','children'=>array()),
            array( 'id'=>6,'name'=>'Lab. A-127-2','ip'=>'','status'=>'','actions'=>'','children'=>array()),
            array( 'id'=>7,'name'=>'Despachos','ip'=>'','status'=>'','actions'=>'','children'=>array()),
        );

        $vb=new VboxClientHandler("Maquinas Virtuales");
        $vms=$vb->enumerate(false);
        $rvms=$vb->enumerate(true);
        if (!is_array($vms)) return $data;
        $childrens=&$data[0]['children'];
        $count=0;
        foreach ($vms as $vm) {
            $ip="";
            $status=in_array($vm,$rvms)?"On":"Off";
            if ($status=="On") {
                // PENDING get ip, type and so
                $ip="10.0.0.".$count++;
            }
            $childrens[]=array('id'=>1000+$count,'name'=>$vm,'ip'=>$ip,'status'=>$status,'actions'=>'','children'=>array());
        }
        return $data;
    }
}