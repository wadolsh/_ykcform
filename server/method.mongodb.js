var mongodb = require('mongodb');
var ObjectID = mongodb.ObjectID;
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


exports.login = function(reqData, callback, req){
    mongodb.MongoClient.connect(config.method.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.tableName).findOne({_id : reqData.id}, function (err, doc) {
            if(err) throw err;
            
            req.session.user = {
                user_id: doc._id,
                name: doc.name
            };
            
            var resData = {};
            resData[reqData.key] = doc;
            callback(resData);
        });
    });
};


/**
 * 1件取得
 */
exports.reqData = function(reqData, callback){
    mongodb.MongoClient.connect(config.method.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.tableName).findOne({_id : reqData.id}, function (err, docs) {
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
    mongodb.MongoClient.connect(config.method.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.tableName).find(reqData.parm).toArray(function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            resData[reqData.key] = docs;
            callback(resData);
        });
    });
};

exports.reqInsert = function(reqData, callback){
    mongodb.MongoClient.connect(config.method.db.url, function(err, db) {
        if(err) throw err;
        // id採番
        reqData['_id'] = newId();
        db.collection(reqData.tableName).insert(reqData, {w:1}, function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            resData[reqData.key] = docs;
            callback(resData);
        });
    });
};

exports.reqUpdate = function(reqData, callback){
    mongodb.MongoClient.connect(config.method.db.url, function(err, db) {
        if(err) throw err;
        // id採番
        delete reqData._id;
        db.collection(reqData.tableName).update({_id : reqData.id}, {$set : reqData}, function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            resData[reqData.key] = docs;
            callback(resData);
        });
    });
};


exports.reqDelete = function(reqData, callback){
    mongodb.MongoClient.connect(config.method.db.url, function(err, db) {
        if(err) throw err;
        db.collection(reqData.tableName).remove({_id : reqData.id}, {w:1}, function (err, docs) {
            if(err) throw err;
            console.log(docs);
            var resData = {};
            resData[reqData.key] = docs;
            callback(resData);
        });
    });
};