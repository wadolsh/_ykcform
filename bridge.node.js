
/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

var server = http.createServer(app);
app.use(express.cookieParser("cookieParser"));
app.use(express.session({secret: 'secret'}));

app.use(express.static(path.resolve(__dirname, 'client')));
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.json());
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.configure('development', function(){
  app.use(express.errorHandler());
})

server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
    var addr = server.address();
    console.log("server listening at", addr.address + ":" + addr.port);
});

bridge_config = require('./server/config');
var method = require('./server/' + bridge_config.method.file);

app.post('/bridge', function(req, res){
    console.log(req.body.req[0]);
    var reqData = JSON.parse(req.body.req[0]);
    method.excuteMethod(reqData, req, res)
});




