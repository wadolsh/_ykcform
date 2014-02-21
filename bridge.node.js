
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');

config = require('./server/config');
var method = require('./server/' + config.method.file);

var app = express();
var server = http.createServer(app);
app.use(express.cookieParser("cookieParser"));
app.use(express.session({secret: 'secret'}));

app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.bodyParser());
app.use(express.json());

app.get('/bridge', function(req, res){
    res.send('hello world get');
});

app.post('/bridge', function(req, res){
    console.log(req.body.req[0]);
    var reqData = JSON.parse(req.body.req[0]);
    excuteMethod(reqData, req, res)
});


server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("server listening at", addr.address + ":" + addr.port);
});

/**
 * 機能を実行
 */
var excuteMethod = function(reqData, req, res) {
    method[reqData.method](reqData, function(result) {
        
        res.json(result);
    }, req, res);
};
