console.log('parent ='  + module.parent.exports.mongodbMethod);

exports.login = function(reqData, callback, req){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        db.collection(exports.methodConfig.db.user_dataName)
            .findOne({login_id : reqData.data.login_id, password: reqData.data.password}, function (err, doc) {

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