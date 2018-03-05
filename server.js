const books = require('./books.js');
const request = require('request');
const express = require('express');
const http = require('http');
const fs = require('fs');
const socket = require('socket.io');
const path = require('path');

const async = require('asyncawait/async');
const await = require('asyncawait/await');

const db = require('./db.js');

const app = express();
app.use(express.static('public'));

const server = http.createServer(app);
const io = socket.listen(server);

const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client('391608746435-3o8bek4ep6smguelu2c6bqqejh1rudoi.apps.googleusercontent.com');
function verifyToken(t,c){
    (async (function verify(token,callback) {
      const ticket = await (client.verifyIdToken({
          idToken: token,
          audience: '391608746435-3o8bek4ep6smguelu2c6bqqejh1rudoi.apps.googleusercontent.com',  // Specify the CLIENT_ID of the app that accesses the backend
      }));
      const payload = ticket.getPayload();
      const userid = payload['sub'];
      // If request specified a G Suite domain:
      //const domain = payload['hd'];
      if (payload.email_verified)callback(userid);
      else callback(null);
    }))(t,c).catch(console.error);
}


app.get('/',function(req,res){
    console.log("hi");
    fs.readFile(path.resolve(path.join(__dirname,'/public/index.html')),function(err, html){
        if(err) res.end(err);
        else{
            res.writeHeader(200, {"Content-Type": "text/html"});  
            res.write(html);
            res.end();
        }
    });
});

function booksFromServer(){
    request.post(
        'https://slhs.goalexandria.com/7068693/ajax/rws_search_request',
        { json: { Interface: 'explore', paneID: "v6 explore start", curButton: 2, 
        SearchField0: "Most Popular", ctrl_dssn: "7068693", maximumHits: 3000,
        localCollection: 1
        } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                books.writeJSONFile(JSON.stringify(body.items),function(){
                    books.readJSONFile(function(){
                        console.log("Got books from server!!!");
                    });
                });
            }
        }
    );
}

function startup(){
    console.log("starting");
    books.readJSONFile(function(error){
        console.dir(error);
        db.connect(function(){
            server.listen(process.env.PORT, process.env.IP, function () {
                console.log('Example app listening!');
                setInterval(function(){
                    booksFromServer();
                },(24*60*60*1000));
            });
        });
    });
}
io.sockets.on("connection",function(socket){
    socket.on("random book", function(callback){
        callback(books.getBook());
    });
    socket.on("store book", function(token, rsn, callback){
        verifyToken(token, function(userid){
            db.read('users',{'userid':userid},function(data){
                if (data.length === 0){
                    db.create('users',{'userid':userid,books:[rsn]},function(){
                        callback();
                    });
                }
                else{
                    data[0].books.push(rsn);
                    db.update('users',{'userid':userid},{'userid':userid,books:data[0].books},function(result){
                        //dbconsole.log(result);
                        callback();
                    });
                }
            });
        });
    });
    socket.on("get stored books", function(token,callback){
        verifyToken(token, function(userid){
            db.read('users',{'userid':userid},function(data){
                if (data.length === 0) callback([]);
                else callback(data[0].books);
            });
        });
    });
    socket.on("get book from rsn", function(rsn,callback){
        callback(books.getBook(books.getIndexFromRSN(rsn)));
    });
    socket.on("delete", function(token, rsn, callback){
        verifyToken(token, function(userid){
            db.read('users',{'userid':userid},function(data){
                if (data.length === 0) callback(false);
                if (data.length !== 0){
                    for (let i = data[0].books.length-1; i>=0; i--){
                        if (data[0].books[i] == rsn){
                            data[0].books.splice(i,1);
                            break;
                        }
                    }
                    db.update('users',{'userid':userid},data[0],function(){
                        return callback(true);
                    });
                }
            });
        });
    });
    socket.on("signin", function(token,callback){
        verifyToken(token, function(userid){
            db.read('users',{'userid':userid},function(data){
                if (data.length === 0){
                    db.create('users',{'userid':userid,books:[]},function(){
                        callback();
                    });
                }
                else callback();
            });
        });
    });
    socket.on("more info", function(rsn1, callback){
        console.log(rsn1);
        request.post(
        'https://slhs.goalexandria.com/7068693/ajax/rws_detail_request',
        { json: {rsn:rsn1, ctrl_dssn: "7068693"
        } },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                callback(body.summary);
            }
        }
    );
    });
});
startup();