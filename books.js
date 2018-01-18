'use strict';
const fs = require('fs');
const path = require('path');

const datafile = path.resolve(path.join(__dirname,'data.json'));
let books = [];
let length = 0;

function readJSONFile(callback){
    fs.readFile(datafile,function(error, data){
        if (error){
            return callback(error);
        }
        else{
            books = JSON.parse(data);
            length = books.length;
            return callback(null);
        }
    });
}

function writeJSONFile(data, callback){
    fs.writeFile(datafile, data, 'utf-8', function(error){
       callback(error); 
    });
}

function getRandomBook(){
    return books[Math.floor(Math.random()*length)];
}



readJSONFile();