
exports.login = function(reqData, callback, req){
    mongodb.MongoClient.connect(bridge_config.loginMethod.db.url, function(err, db) {
        if(err) throw err;
        db.collection(bridge_config.loginMethod.db.user_dataName)
            .findOne({login_id : reqData.data.login_id, password: reqData.data.password}, function (err, doc) {
                
            console.log(doc);
            if(err) throw err;
            
            var resData = {};
            if (doc != null) {
                req.session.user = {
                    _id: doc._id,
                    login_id: doc.login_id,
                    name: doc.name
                };
                req.session.login_id = doc.login_id;
                
                console.log(req.session);
                
                resData[reqData.key] = doc;
            } else {
                resData[reqData.key] = {warm : "login失敗"};
            }

            callback(resData);
        });
    });
};


exports.logout = function(reqData, callback, req){
    delete req.session.user;
};