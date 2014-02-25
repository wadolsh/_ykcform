var loginCheck = function(reqData, req, res) {
    console.log(req.session);
    if (!req.session.login_id) {
        console.log('ログイン情報なしb');
        throw new Error('ログイン情報なし');
    }
}


exports.method = {
    file : 'method.mongodb',
    db : {
        url: 'mongodb://ykcform:454545@ds041188.mongolab.com:41188/ykcform',
        user_dataName: 'login_user',
        allow_dataName: ['mydata'],
    },
    filter : [loginCheck]
}

exports.loginMethod = {
    file : 'loginMethod.mongodb',
    db : exports.method.db
}
