'use strict';
const fs = require('fs');
const path = require('path');

const datafile = path.resolve(path.join(__dirname,'data.json'));
let books = [];
let length = 0;

function readJSONFile(callback){
    fs.readFile(datafile,'utf-8', function(error, data){
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
       return callback(error); 
    });
}

function getBook(index){
    var temp;
    if (index == -1) return null;
    if (!index || index < 0 || index > length) temp = books[Math.floor(Math.random()*length)];
    else  temp = books[index];
    return temp;
}

function getTitle(index){
    if (index && index >=0 && index < length) return books[index].title;
    else return "BOOK NOT FOUND";
}

function getSubTitle(index){
    if (index && index >=0 && index < length) return books[index].subtitle;
    else return "";
}

function getLastBook(){
    return books[length - 1];
}

function getPictureUrl(index){
    if (index && index >=0 && index < length) return "https://slhs.goalexandria.com/7068693" + books[index].image;
    else return "https://openclipart.org/image/2400px/svg_to_png/211479/Simple-Image-Not-Found-Icon.png";
}
function getAuthor(index){
    if (index && index >=0 && index < length){
        if (books[index].author_printable) return books[index].author_printable;
        else books[index].author_printable;
    }  
    else return "AUTHOR NOT FOUND";
}
function available(index){
    if (index && index >=0 && index < length) return books[index].hasCopies;
    else return false;
}
function getRSN(index){
    if (index && index >=0 && index < length) return books[index].rsn;
    else return "";
}

function getSeries(index){
    var temp = [];
    if (index && index >=0 && index < length) temp =  books[index].series;
    for (var i = 0; i < temp.length; i++){
        temp[i] = formatSeries(temp[i]);
    }
    return temp;
}

function getIndexFromRSN(rsn){
    for (let i = 0; i < length; i++) if (books[i].rsn === rsn) return i;
    return -1; 
}
function getBooksInSeries(series){
    if (series === '') return [];
    let arr = [];
    let temp;
    for (let i = 0; i < length; i++){
        temp = getSeries(i);
        for (let j = 0; j < temp.length; temp++){
            if (formatSeries(temp[j]) === series) arr.push(getBook(i));
        }
    }
    return arr;
}

function formatSeries(series){
    let temp = ""
    for (let i = 0; i < series.length; i++){
        const t = series.substring(i,i+1);
        temp+=t;
        if (t === ';')return temp.substring(0,temp.length - 2);
    }
    return temp;
}

exports.readJSONFile = readJSONFile;
exports.writeJSONFile = writeJSONFile;
exports.getBook = getBook;
exports.getTitle = getTitle;
exports.getPictureUrl = getPictureUrl;
exports.getAuthor = getAuthor;
exports.available = available;
exports.getRSN = getRSN;
exports.getSeries = getSeries;
exports.getIndexFromRSN = getIndexFromRSN;
exports.getLastBook = getLastBook;
exports.getBooksInSeries = getBooksInSeries;