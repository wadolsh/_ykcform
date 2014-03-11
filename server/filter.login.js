exports.loginCheck = function(reqData, req, res) {
    if (!req.session.user) {
        console.log('user session is not existed!');
        throw new Error('ログイン情報なし');
    }
}

exports.addLastUpdate = function(reqData, req) {
    var method = reqData.method;
    if (method.indexOf('Update') > 0
        || method.indexOf('Insert') > 0
        || method.indexOf('Save') > 0) {
        
        if (req.session.user) {
            reqData.data.last_update_user = req.session.user._id;
        }
        reqData.data.last_update_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');

    } else if (method.indexOf('reqData') > -1 || method.indexOf('reqList') > -1) {
        console.log('last_update_user insert !');
        reqData.parm.last_update_user = req.session.user._id;
    }
}
