console.log('bridge.config file path = ' + module.filename);

var commonFilter = require('../bridge/lib/filter.common');
var loginFilter = require('./filter.login');

exports.commonMethod = {
    module : require('../bridge/lib/method.common'),
}

exports.mongodbMethod = {
    module : require('../bridge/lib/method.mongodb'),
    db : {
        url: 'mongodb://ykcform:454545@ds041188.mongolab.com:41188/ykcform',
        user_dataName: 'login_user',
        allow_dataName: ['mydata'],
    },
    beforeFilter : [commonFilter.startLogger, loginFilter.loginCheck, loginFilter.addLastUpdate],
    afterFilter : [commonFilter.endLogger]
}

exports.loginMethod = {
    module : require('./method.login'),
    db : exports.mongodbMethod.db,
    beforeFilter : [commonFilter.startLogger],
    afterFilter : [commonFilter.endLogger]
}
