console.log('bridge.config file path = ' + module.filename);

var commonFilter = require('../bridge/lib/filter.common');
var loginFilter = require('./filter.login');
var orignChecker = function(reqData, req, res) {
    if (req.headers.origin.indexOf('bridge-choish.c9.io') > -1
        || req.headers.origin.indexOf('ykcform.herokuapp.com') > -1) {
        
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
        url: 'mongodb://ykcform:454545@ds041188.mongolab.com:41188/ykcform',
        user_dataName: 'login_user',
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
                , login_user: {save : 2, read : 0}
                , service_time: {save : 1, read : 1}
                , find_service: {save : 1, read : 0}
                , find_service_plan: {save : 1, read : 1}
                , app_setting: {save : 1, read : 0}
                , kanaga14: {save : 0, read : 0}
    }
}
exports.loginMethod.module.init(exports.loginMethod);

exports.ykcformMethod = {
    module : require('./method.ykcform'),
    db : exports.mongodbMethod.db,
    beforeFilter : [orignChecker, commonFilter.startLogger, loginFilter.loginCheck, loginFilter.authCheck, loginFilter.addLastUpdate],
    afterFilter : [commonFilter.endLogger],
}