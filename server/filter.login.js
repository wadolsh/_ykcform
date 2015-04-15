var idName = null;
exports.init = function(config) {
    idName = config.db.idName;
}


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
        
        if (!reqData.data[idName]) {
            if (req.session.user) {
                reqData.data.first_update_name = req.session.user['name'];
                reqData.data.first_update_user = req.session.user[idName];
            }
            reqData.data.first_update_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
        }
        
        if (req.session.user) {
            reqData.data.last_update_name = req.session.user['name'];
            reqData.data.last_update_user = req.session.user[idName];
        }
        reqData.data.last_update_date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    }
}

var authCheckLogic = {
    Update : function(authData, reqData, req) {
        if (authData.save) {
            var user = req.session.user;
            var dataName = reqData.dataName;
            if (authData.save == 0 && user) {
                return true;
            /*
            } else if (authData.save == 1 && user) {
                if (!user.memberType || user.memberType < authData.save) {
                    req.query = {last_update_user : user[idName]};
                }
                return true;
            } else if (user.memberType > authData.save) {
                return true;
            }
            */
            } else if (authData.save == 1 && user) {
                if (!user._auth || !user._auth[dataName] || user._auth[dataName].save < authData.save) {
                    req.query = {last_update_user : user[idName]};
                }
                return true;
            } else if (user._auth && user._auth[dataName] && user._auth[dataName].save > authData.save) {
                return true;
            }
            return false;
        }
        return true;
    },
    reqData : function(authData, reqData, req) {
        if (req.session && req.session.user) {
            console.log('last_update_user insert !');
        	reqData.parm.last_update_user = req.session.user[idName];
        }
        if (authData.read) {
            var user = req.session.user;
            var dataName = reqData.dataName;
            if (authData.read == 0 && user) {
                return true;
            /*
            } else if (authData.read == 1 && user) {
                if (!user.memberType || user.memberType < authData.read) {
                    if(reqData.parm.$query) {
                        reqData.parm.$query.last_update_user = user[idName];
                    } else {
                        reqData.parm.last_update_user = user[idName];
                    }
                }
                return true;
            } else if (user.memberType > authData.read) {
                return true;
            }
            */
            } else if (authData.read == 1 && user) {
                if (!user._auth || !user._auth[dataName] || user._auth[dataName].read < authData.read) {
                    if(reqData.parm.$query) {
                        reqData.parm.$query.last_update_user = user[idName];
                    } else {
                        reqData.parm.last_update_user = user[idName];
                    }
                }
                return true;
            } else if (user._auth && user._auth[dataName] && user._auth[dataName].read > authData.read) {
                return true;
            }
            return false;
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