mongodb = require('mongodb');
ObjectID = mongodb.ObjectID;
//https://github.com/mongodb/node-mongodb-native
//http://mongodb.github.io/node-mongodb-native/api-generated/collection.html



var newId = function() {
    // Create a new ObjectID
    return new ObjectID().toHexString();
};

var idName = null;
exports.init = function(config) {
    idName = config.db.idName;
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
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        var query = {};
        query[idName] = reqData[idName];
        db.collection(reqData.dataName).findOne(query, function (err, docs) {
            if(err) throw err;
            callback(docs);
        });
    });
};

/**
 * リスト取得
 */
exports.reqList = function(reqData, callback){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        var result = db.collection(reqData.dataName).find(reqData.parm);
        if (reqData.option) {
            var option = null;
            for (var key in reqData.option) {
                option = reqData.option[key];
                result[key](option);
            }
        }
        result.toArray(function (err, docs) {
            if(err) throw err;
            callback(docs);
        });
    });
};

exports.reqInsert = function(reqData, callback){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        // id採番
        reqData.data[idName] = newId();
        db.collection(reqData.dataName).insert(reqData.data, {w:1}, function (err, docs) {
            if(err) throw err;
            callback(docs[0]);
        });
    });
};

exports.reqUpdate = function(reqData, callback, req){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        var query = req.query ? req.query : {};
        query[idName] = reqData.data[idName];
        delete reqData.data[idName];
        db.collection(reqData.dataName).update(query, {$set : reqData.data}, function (err, docs) {
            if(err) throw err;

            if (docs == 0) {
                callback({});
            }
            
            callback(reqData.data);
        });
    });
};

exports.reqSave = function(reqData, callback, req){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        var id = reqData.data[idName];
        if(id) {
            //update
            var query = req.query ? req.query : {};
            query[idName] = id;
            delete reqData.data[idName];
            db.collection(reqData.dataName).update(query, {$set : reqData.data}, function (err, docs) {
                if(err) throw err;

                if (docs == 0) {
                    callback({});
                }
                
                callback(reqData.data);
            });
        } else {
            reqData.data[idName] = newId();
            db.collection(reqData.dataName).insert(reqData.data, {w:1}, function (err, docs) {
                if(err) throw err;
                callback(docs[0]);
            });
        }
    });
};


exports.reqDelete = function(reqData, callback, req){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        var query = reqData.query ? reqData.query : {};
        query[idName] = reqData[idName];
        console.log(reqData);
        console.log(query);
        db.collection(reqData.dataName).remove(query, {w:1}, function (err, docs) {
            if(err) throw err;
            callback(docs);
        });
    });
};