function statusStyler(val,row,idx) {
    color ="#FFFFFF";
    if      (val==="Off") color="#DDDDDD";
    else if (val==="On") color="#80FF40";
    else if (val==="???") color="#C0C000";
    else if (val==="Busy") color="#00FFFF";
    else if (val==="Error") color="#FF8020";
    return 'background-color:'+color;
}
