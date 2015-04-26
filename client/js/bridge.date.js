/**
 * choish
 */
(function(){
    var root = this;
    var Bridge = root.Bridge;
    
    var dateStr = Bridge.dateStr = {
        regexp: new RegExp('(y{1,4})|(MM)|(dd)|(HH)|(hh)|(mm)|(ss)|(S{1,3})|(E)', 'g'),
        format: function(format, date) {
            return format.replace(this.regexp, function(match, yyyy, MM, dd, HH, hh, mm, ss, SS, E, offset){
                if (yyyy) {
                    return date.getFullYear().toString().slice(-yyyy.length);
                } else if (MM) {
                    return ('0' + (date.getMonth() + 1)).slice(-2);
                } else if (dd) {
                    return ('0' + date.getDate()).slice(-2);
                } else if (HH) {
                    return ('0' + date.getHours()).slice(-2);
                } else if (hh) {
                    return ('0' + date.getHours()).slice(-2);
                } else if (mm) {
                    return ('0' + date.getMinutes()).slice(-2);
                } else if (ss) {
                    return ('0' + date.getSeconds()).slice(-2);
                } else if (SS) {
                    return date.getMilliseconds().toString().slice(0, SS.length);
                } else if (E) {
                    return date.getDay();
                }
            });
        },
        getNowDate : function(format) {
            return this.format(format || 'yyyy-MM-dd HH:mm:ss', new Date());
        }
    }
}).call(this);