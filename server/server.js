var express = require("express");

var sync = express.createServer();
sync.use(express.cookieParser());
sync.use(express.session({secret: 'nyancat'}));

sync.get('/', function(req, res) {
    res.send("this is not zombocom");
});

sync.get('/repo/list', function(req, res) {

});

sync.get('/include.html', function(req, res) {
    res.sendfile('include.html');
});

sync.get('/js/include.js', function(req, res) {
    res.sendfile('include.js');	
});

sync.listen(8080);
