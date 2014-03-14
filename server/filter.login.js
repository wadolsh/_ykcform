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
    }
}

var authCheckLogic = {
    Update : function(authData, reqData, req) {
        if (authData.save) {
            var user = req.session.user;
            if (authData.save == 1 && user) {
                if (!user.memberType && user.memberType < authData.save) {
                    req.query = {last_update_user : user.id};
                }
                return true;
            } else if (user.memberType > authData.save) {
                return true;
            }
            return false;
        }
        return true;
    },
    reqData : function(authData, reqData, req) {
        console.log('last_update_user insert !');
        if (req.session && req.session.user) {
        	reqData.parm.last_update_user = req.session.user._id;
        }
        return true;
    }
}
authCheckLogic.Insert = authCheckLogic.Update;
authCheckLogic.Save = authCheckLogic.Update;
authCheckLogic.Delete = authCheckLogic.Update;
authCheckLogic.reqList = authCheckLogic.reqData;

exports.authCheck = function(reqData, req, res) {
    var method = reqData.method;
    var authData = bridge_config.loginMethod.authCheck[reqData.dataName];
    if (authData) {

        for (var key in authCheckLogic) {
            if (method.indexOf(key) > -1) {
                if(!authCheckLogic[key](authData, reqData, req)) {
                    throw new Error('接近不可データー');
                };
            }
        }
        return true;
    } else {
        throw new Error('接近不可データー');
    }

}