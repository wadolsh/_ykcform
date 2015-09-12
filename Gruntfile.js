/**
 * Module dependencies.
 */

var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

var server = http.createServer(app);
app.use(require('connect-livereload')({
  port: 8182,
  hostname:"157.7.133.77"
}));
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
/*
app.configure('production', function(){
  app.use(express.errorHandler());
})
*/

bridge_config = require('./server/bridge.config');
var executer = require('./bridge');

app.post('/bridge', function(req, res){
    executer.process(req, res);
});


app.all('/*', function(req, res){
    res.json({msg: "処理不可"});
});

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-connect');
    
    grunt.initConfig({
      
        connect: {
          all: {

          }
        },
        
        watch: {
            options: {
                livereload: 8182
            },
            js: {
                files: 'client/**/*.js'
            },
            html: {
                files: 'client/**/*.html'
            }
        }
    });
    
    grunt.registerTask('connect', 'Start a custom static web server.', function() {
      //grunt.log.writeln('Starting static web server in "www-root" on port 9001.');
      //connect(serveStatic.static('www-root')).listen(9001);
      
        server.listen(process.env.PORT || 3000, process.env.IP || "0.0.0.0", function(){
            var addr = server.address();
            console.log("server listening at", addr.address + ":" + addr.port);
        });


    });

    grunt.registerTask('default', [ 'connect', 'watch']);
};


