console.log('parent ='  + module.parent.exports.mongodbMethod);
var crypto = require('crypto');


var sha256 = function(str) {
    return crypto.createHash('sha256').update(str).digest("hex");
}

var idName = null;
exports.init = function(config) {
    idName = config.db.idName;
}

exports.login = function(reqData, callback, req){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        db.collection(exports.methodConfig.db.user_dataName)
            .findOne({login_id : reqData.data.login_id, password: sha256(reqData.data.password)}, function (err, doc) {

            if(err) throw err;
            
            if (doc != null) {
                req.session.user = {
                    _id: doc._id,
                    login_id: doc.login_id,
                    name: doc.name
                };
                console.log('login success! ' + req.session.user);
                callback(doc);
            } else {
                console.log('login fail!');
                callback({result: false, warm : "login失敗"});
            }
        });
    });
};


exports.logout = function(reqData, callback, req){
    delete req.session.user;
    console.log('logout success!');
    callback({result : true, msg: 'logout'});
};

exports.loginChecker = function(reqData, callback, req){
	console.log('loginChecker!');
    callback(req.session.user || {});
};


exports.signup = function(reqData, callback, req){
    
    if (reqData.data.password != reqData.data.password2) {
        callback({result: false, msg : "パスワード不一致。"});
        return;
    }
    delete reqData.data.password2;
    reqData.data.password = sha256(reqData.data.password);
    
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        db.collection(exports.methodConfig.db.user_dataName)
            .findOne({login_id : reqData.data.login_id}, function (err, doc) {

            if(err) throw err;
            
            if (doc != null) {
                callback({result: false, msg : "仕様されているIDです。"});
            } else {
                if(err) throw err;
                // id採番
                reqData.data[idName] = new ObjectID().toHexString();
console.log(reqData.data);
                db.collection(exports.methodConfig.db.user_dataName).insert(reqData.data, {w:1}, function (err, docs) {
                    if(err) throw err;
                    callback(docs[0]);
                });
            }
        });
    });
};