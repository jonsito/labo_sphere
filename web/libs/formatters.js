function statusStyler(val,row,idx) {
    color ="#FFFFFF";
    if      (val==="Off") color="#DDDDDD";
    else if (val==="On") color="#80FF40";
    else if (val==="???") color="#C0C000";
    else if (val==="Busy") color="#00FFFF";
    else if (val==="Error") color="#FF8020";
    return 'background-color:'+color;
}

$.extend($.fn.validatebox.defaults.rules, {
    regexp: {
        validator: function(value, param){
            return new RegExp(param[0]).test(value);
        },
        message: 'Please enter valid host name. i.e: l056'
    }
});