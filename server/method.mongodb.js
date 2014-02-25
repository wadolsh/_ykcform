mongodb = require('mongodb');
ObjectID = mongodb.ObjectID;
//https://github.com/mongodb/node-mongodb-native
//http://mongodb.github.io/node-mongodb-native/api-generated/collection.html

var customMethod = {};
for(var key in bridge_config) {
    if (key == "method") {
        continue;
    }
    console.log("method module load = " + bridge_config[key].file);
    customMethod[key] = require("./" + bridge_config[key].file);
}

/**
 * 機能を実行
 */
exports.excuteMethod = function(reqData, req, res) {

    try {
        
        var configKey = null;
        var methodObj = null;
        if (exports[reqData.method]) {
            configKey = "method";
            methodObj = exports;
        } else {
            var selected = null;
            for (var key in customMethod) {
                selected = customMethod[key];
                if (selected[reqData.method]) {
                    configKey = key;
                    methodObj = selected;
                }
            }
        }
        
        exports.beforeFilter(configKey, reqData, req, res);
        methodObj[reqData.method](reqData, function(result) {
            exports.afterFilter(configKey, reqData, result, req, res);
            res.json(result);
        }, req, res);

    } catch (e) {
        console.log(e);
        res.json({error : "エラー"});
    } finally {
        
    }
};

var newId = function() {
    // Create a new ObjectID
    return new ObjectID().toHexString();
};

exports.beforeFilter = function(configKey, reqData, req, res) {
    console.log("beforeFilter");
    
    var filters = bridge_config[configKey].filter;
    if (filters) {
        for(var ind in filters) {
            filters[ind](reqData, req, res);
        }
    }

    //throw new Error('例外');
}

exports.afterFilter = function(configKey, reqData, result, req, res) {
    console.log("afterFilter");
    
    var filters = bridge_config[configKey].filter;
    if (filters) {
        for(var ind in filters) {
            filters[ind](reqData, result, req, res);
        }
    }
}



/*
var Db = require('mongodb').Db,
    MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server,
    ReplSetServers = require('mongodb').ReplSetServers,
    ObjectID = require('mongodb').ObjectID,
    Binary = require('mongodb').Binary,
    GridStore = require('mongodb').GridStore,
    Grid = require('mongodb').Grid,
    Code = require('mongodb').Code,
    BSON = require('mongodb').pure().BSON,
    assert = require('assert');
*/




/**
 * 1件取得
 */
exports.reqData = function(reqData, callback){
    mongodb.MongoClient.connect(bridge_config.method.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.dataName).findOne({_id : reqData.id}, function (err, docs) {
            if(err) throw err;
            var resData = {};
            resData[reqData.key] = docs;
            callback(resData);
        });
    });
};

/**
 * リスト取得
 */
exports.reqList = function(reqData, callback){
    mongodb.MongoClient.connect(bridge_config.method.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.dataName).find(reqData.parm).toArray(function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            resData[reqData.key] = docs;
            callback(resData);
        });
    });
};

exports.reqInsert = function(reqData, callback){
    mongodb.MongoClient.connect(bridge_config.method.db.url, function(err, db) {
        if(err) throw err;
        // id採番
        reqData.data['_id'] = newId();
        db.collection(reqData.dataName).insert(reqData.data, {w:1}, function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            resData[reqData.key] = docs[0];
            callback(resData);
        });
    });
};

exports.reqUpdate = function(reqData, callback){
    mongodb.MongoClient.connect(bridge_config.method.db.url, function(err, db) {
        if(err) throw err;
        var id = reqData.data._id;
        delete reqData.data._id;
        db.collection(reqData.dataName).update({_id : id}, {$set : reqData.data}, function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            
            if (docs == 0) {
                callback(resData);
            }
            
            resData[reqData.key] = reqData.data;
            callback(resData);
        });
    });
};

exports.reqSave = function(reqData, callback){
    mongodb.MongoClient.connect(bridge_config.method.db.url, function(err, db) {
        if(err) throw err;
        
        if(reqData.data._id) {
            //update
            var id = reqData.data._id;
            delete reqData.data._id;
            db.collection(reqData.dataName).update({_id : id}, {$set : reqData.data}, function (err, docs) {
                if(err) throw err;
                console.log(docs);
                var resData = {};
                
                if (docs == 0) {
                    callback(resData);
                }
                
                resData[reqData.key] = reqData.data;
                callback(resData);
            });
        } else {
            reqData.data['_id'] = newId();
            db.collection(reqData.dataName).insert(reqData.data, {w:1}, function (err, docs) {
                if(err) throw err;
                console.log(docs);
                var resData = {};
                resData[reqData.key] = docs[0];
                callback(resData);
            });
        }
    });
};


exports.reqDelete = function(reqData, callback){
    mongodb.MongoClient.connect(bridge_config.method.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.dataName).remove({_id : reqData.id}, {w:1}, function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            resData[reqData.key] = docs;
            callback(resData);
        });
    });
};