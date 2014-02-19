
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

var app = express();
var server = http.createServer(app);
app.use(express.static(path.resolve(__dirname, 'client')));

app.get('/bridge', function(req, res){
    res.send('hello world get');
});

app.post('/bridge', function(req, res){
    res.send('hello world post');
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("Chat server listening at", addr.address + ":" + addr.port);
});

