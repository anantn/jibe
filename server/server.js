var express = require('express');
var storage = require('./storage');

var sync = express.createServer();
sync.use(express.bodyParser());
sync.use(express.cookieParser());
sync.use(express.session({secret: 'nyancat'}));

sync.get('/', function(req, res) {
    res.send('this is not zombocom');
});

sync.get('/include.html', function(req, res) {
    res.sendfile('include.html');
});

sync.get('/js/jschannel.js', function(req, res) {
    res.sendfile('jschannel.js');    
});

sync.get('/js/include.js', function(req, res) {
    res.sendfile('include.js');	
});

sync.post('/repo/list', function(req, res) {
    storage.getAppsForUser(req.body, function(result) {
        if ('error' in result) {
            res.send(result.error, 401);
        } else if ('success' in result) {
            res.send(result.success);
        } else {
            res.send("Unknown error", 500);
        }
    });
});

sync.listen(8080);
