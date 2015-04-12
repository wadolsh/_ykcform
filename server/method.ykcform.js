console.log('bridge.config file path = ' + module.filename);

exports.mainMenuList = function(reqData, callback, req){
	console.log('mainMenuList!');
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        db.collection('app_setting').findOne({_id: 'apps'}, function (err, doc) {
                
            if(err) throw err;
            
            if (doc != null && doc.apps) {
                var apps = doc.apps;
                var user = req.session.user;
                for (var key in apps) {
                    if (apps[key].read == 0) {
                        
                    } else if (!user._auth || !user._auth[key] || user._auth[key].read < apps[key].read) {
                        delete doc.apps[key];
                    }
                }
                //console.log('login success! ' + req.session.user);
                callback(doc);
            } else {
            }
        });
    });
};