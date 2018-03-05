var assert = require("assert");
var MongoClient = require("mongodb").MongoClient;

var db;

var connect = function(callback){
    process.stdout.write("Connecting to database... ");
    MongoClient.connect("mongodb://"+process.env.IP+":27017/sessionData", function(err, client){
        db = client.db('sessionData');
        assert.equal(err, null, "Mongo failed to start");
        console.log("db done.");
        callback();
    });
};


function create(collection, doc, callback){
    db.collection(collection).insertOne(doc, function(err, result){
        assert.equal(err, null, "The database encountered an error while creating.");
        callback(err, result);
    });
}

function read(collection, where, callback){
    db.collection(collection).find(where).sort({time:1}).toArray(function(err, docs){
        assert.equal(err, null, "The database encountered an error while reading.");
         callback(docs);
    });
}

function update(collection, where, doc, callback){
    db.collection(collection).update(where, doc, function(err, result){
        assert.equal(err, null, "The database encountered an error while updating.");
        callback(result);
    });
}

function remove(collection, where, callback){
    db.collection(collection).remove(where, function(err, result){
        assert.equal(err, null, "The database encountered an error while deleting.");
        callback(result);
    });
}

function distinct(collection, field, where, sort, callback){
    db.collection(collection).distinct(field, where).sort(sort, function(err, docs){
        assert.equal(err, null, "The database encountered an error while reading.");
        callback(docs);
    });
}

function readAmount(collection, number, direction, where, callback){//most recent
    db.collection(collection).find(where).sort({time: direction}).limit(number).toArray(function(err, docs){
        assert.equal(err, null, "The database encountered an error while reading.");
        callback(docs);
    });
}

exports.connect = connect;
exports.create = create;
exports.read   = read;
exports.update = update;
exports.remove = remove;
exports.distinct = distinct;
exports.readAmount = readAmount;
