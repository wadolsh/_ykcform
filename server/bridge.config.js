console.log('bridge.config file path = ' + module.filename);

var commonFilter = require('../bridge/lib/filter.common');
var loginFilter = require('./filter.login');
var orignChecker = function(reqData, req, res) {
    if (req.headers.origin.indexOf('bridge-choish.c9.io') > -1
        || req.headers.origin.indexOf('ykcform.herokuapp.com') > -1
        || req.headers.origin.indexOf('http://uwkk2251a358.wadolsh.koding.io') > -1
        || req.headers.origin.indexOf('157.7.133.77') > -1) {
        
    } else {
        throw new Error('接近不可');
    };
    //console.log(req);
}

exports.commonMethod = {
    module : require('../bridge/lib/method.common'),
}

exports.mongodbMethod = {
    module : require('../bridge/lib/method.mongodb'),
    db : {
        idName: '_id',
        useOid: false ,
        url: 'mongodb://ykcform:454545@ds041188.mongolab.com:41188/ykcform',
        //url: 'mongodb://mongodb:27017/ykcform',
        user_dataName: 'login_user',
        collections: {
            jpon2012: {
                idName: '_id',
                useOid: true
            }
        }
    },
    beforeFilter : [orignChecker, commonFilter.startLogger, loginFilter.loginCheck, loginFilter.authCheck, loginFilter.addLastUpdate],
    afterFilter : [commonFilter.endLogger],
}
loginFilter.init(exports.mongodbMethod);
exports.mongodbMethod.module.init(exports.mongodbMethod);

exports.loginMethod = {
    module : require('./method.login'),
    db : exports.mongodbMethod.db,
    beforeFilter : [orignChecker, commonFilter.startLogger],
    afterFilter : [commonFilter.endLogger],
    authCheck: {mydata : {}
                , login_user: {_write : 2, _read : 0}
                , service_time: {_write : 1, _read : 1}
                , find_service: {
                    _write : 1,
                    _read : 0,
                    _field: {
                        result: {
                            _write: 0
                        },
                        isNew: {
                            _write: 0
                        },
                        findServiceComment: {
                            _write: 0
                        },
                        result_update_name: {
                            _write: 0
                        },
                        result_update_date: {
                            _write: 0
                        },
                        result_update_user: {
                            _write: 0
                        },
                        findServiceLat: {
                            _write: 0
                        },
                        findServiceLng: {
                            _write: 0
                        },
                        findServiceVisitHistory: {
                            _write: 0
                        }
                    }
                }
                , jpon2012: {_write : 1, _read : 0}
                , find_service_plan: {_write : 1, _read : 1}
                , app_setting: {_write : 1, _read : 0}
                , kanaga14: {_write : 0, _read : 0}
                , trtr: {_write : 1, _read : 0}
    }
}
exports.loginMethod.module.init(exports.loginMethod);

exports.ykcformMethod = {
    module : require('./method.ykcform'),
    db : exports.mongodbMethod.db,
    beforeFilter : [orignChecker, commonFilter.startLogger, loginFilter.loginCheck, loginFilter.authCheck, loginFilter.addLastUpdate],
    afterFilter : [commonFilter.endLogger],
}