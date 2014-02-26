

mongodb = require('mongodb');
ObjectID = mongodb.ObjectID;
//https://github.com/mongodb/node-mongodb-native
//http://mongodb.github.io/node-mongodb-native/api-generated/collection.html



var newId = function() {
    // Create a new ObjectID
    return new ObjectID().toHexString();
};



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
        db.collection(reqData.dataName).findOne({_id : reqData.id}, function (err, docs) {
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
        db.collection(reqData.dataName).find(reqData.parm).toArray(function (err, docs) {
            if(err) throw err;
            callback(docs);
        });
    });
};

exports.reqInsert = function(reqData, callback){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        // id採番
        reqData.data['_id'] = newId();
        db.collection(reqData.dataName).insert(reqData.data, {w:1}, function (err, docs) {
            if(err) throw err;
            callback(docs[0]);
        });
    });
};

exports.reqUpdate = function(reqData, callback){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        var id = reqData.data._id;
        delete reqData.data._id;
        db.collection(reqData.dataName).update({_id : id}, {$set : reqData.data}, function (err, docs) {
            if(err) throw err;

            if (docs == 0) {
                callback({});
            }
            
            callback(reqData.data);
        });
    });
};

exports.reqSave = function(reqData, callback){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        
        if(reqData.data._id) {
            //update
            var id = reqData.data._id;
            delete reqData.data._id;
            db.collection(reqData.dataName).update({_id : id}, {$set : reqData.data}, function (err, docs) {
                if(err) throw err;

                if (docs == 0) {
                    callback({});
                }
                
                callback(reqData.data);
            });
        } else {
            reqData.data['_id'] = newId();
            db.collection(reqData.dataName).insert(reqData.data, {w:1}, function (err, docs) {
                if(err) throw err;
                callback(docs[0]);
            });
        }
    });
};


exports.reqDelete = function(reqData, callback){
    mongodb.MongoClient.connect(exports.methodConfig.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.dataName).remove({_id : reqData.id}, {w:1}, function (err, docs) {
            if(err) throw err;
            callback(docs);
        });
    });
};