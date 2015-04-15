console.log('bridge.config file path = ' + module.filename);
var http = require('http');

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

exports.getDataByUrl = function(reqData, callback, req){
	console.log('getDataByUrl!');
	/*
    var parm = {
        url: request.params.url,
        success: function(httpResponse) {
            callback(httpResponse.data || httpResponse.text);
        },
        error: function(httpResponse) {
            callback(httpResponse);
        }
    }
  
    if (reqData.params) {
        parm.params = request.params.params;
    }
    if (reqData.headers) {
        parm.headers = request.params.headers;
    }

    Parse.Cloud.httpRequest(parm);
    */
    
    
    http.get(reqData.data.parm, function(res) {
        var body = '';
        res.setEncoding('utf8');
     
        res.on('data', function(chunk){
            body += chunk;
        });
     
        res.on('end', function(res){
            
            try {
                callback(JSON.parse(body.trim()));
            } catch (e) {
                callback(body);
            }
        });
        
        console.log("Got response: " + res.statusCode);
    }).on('error', function(e) {
        console.log("Got error: " + e.message);
    });
};