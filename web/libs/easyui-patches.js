function statusStyler(val,row,idx) {
    // color por defecto
    color ="#FFFFFF";
    // equipo apagado
    if      (val==="Off") color="#EE3030";
    // estado desconocido
    else if (val==="???") color="#C0C000";
    // equipo encendido
    else if (val==="On") {
        color="#80FF30";
        if (row && row.uptime && (parseInt(row.uptime)>=1 ) ) color="#30BB00";
        if (row && row.network) {
            if (/10000.*Full/.test(row.network)===false) color="#FF8020";
        }
    }
    // equipo ocupado
    else if (val==="Busy") {
        color="#00FFFF";
        if (row && row.uptime && (parseInt(row.uptime)>=1 ) ) color="#00BBBB";
        if (row && row.network) {
            if (/1000.*Full/.test(row.network)===false) color="#CC7080";
        }
    }
    // error de comprobacion
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

/**
 * Add a tooltip provided element, with given text
 * @param {object} obj Element suitable to add a tooltip
 * @param {string} text Data text to be shown
 */
function addTooltip(obj,text) {
    obj.tooltip({
        position: 'top',
        deltaX: 30, // shift tooltip 30px right from top/center
        content: '<span style="color:#000">'+text+'</span>',
        onShow: function(){	$(this).tooltip('tip').css({backgroundColor: '#ef0',borderColor: '#444'	});
        }
    });
}