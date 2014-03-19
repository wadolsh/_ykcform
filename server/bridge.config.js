console.log('bridge.config file path = ' + module.filename);

var commonFilter = require('../bridge/lib/filter.common');
var loginFilter = require('./filter.login');


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
    beforeFilter : [commonFilter.startLogger, loginFilter.loginCheck, loginFilter.authCheck, loginFilter.addLastUpdate],
    afterFilter : [commonFilter.endLogger],
}
loginFilter.init(exports.mongodbMethod);
exports.mongodbMethod.module.init(exports.mongodbMethod);

exports.loginMethod = {
    module : require('./method.login'),
    db : exports.mongodbMethod.db,
    beforeFilter : [commonFilter.startLogger],
    afterFilter : [commonFilter.endLogger],
    authCheck: {mydata : {}, service_time: {save : 1, read : 1}},
}
exports.loginMethod.module.init(exports.loginMethod);
