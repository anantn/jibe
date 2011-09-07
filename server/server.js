var url = require('url');
var http = require('http');
var https = require('https');
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

sync.get('/js/include.js', function(req, res) {
    res.sendfile('include.js'); 
});

sync.get('/js/jschannel.js', function(req, res) {
    res.sendfile('lib/jschannel.js');    
});

sync.get('/js/manifest.js', function(req, res) {
    res.sendfile('lib/manifest.js');
});

sync.get('/js/urlmatch.js', function(req, res) {
    res.sendfile('lib/urlmatch.js');
});

sync.get('/util/fetch', function(req, res) {
    var path = url.parse(req.query['url']);
    var options = {
        host: path.hostname,
        port: path.port,
        path: path.pathname
    };

    var fetcher;
    if (path.protocol == 'http:') {
        fetcher = http;
    } else if (path.protocol == 'https:') {
        fetcher = https;
    } else {
        res.send('Invalid protocol: ' + path.protocol, 500);
        return;
    }

    fetcher.get(options, function(response) {
        // Only fetch manifests
        var type = response.headers['content-type'];
        if (type != 'application/x-web-app-manifest+json') {
            res.send('Invalid Content-Type', 500);
        } else {
            response.on('data', function(chunk) {
                res.send(chunk);
            });
        }
    }).on('error', function(e) {
        res.send('Server error ' + e, 500);
    });
});

sync.post('/repo/list', function(req, res) {
    storage.getAppsForUser(req.body, function(result) {
        if ('error' in result) {
            res.send(result.error, 401);
        } else if ('success' in result) {
            res.send(result.success);
        } else {
            res.send('Unknown error', 500);
        }
    });
});

sync.post('/repo/install', function(req, res) {
    storage.installAppForUser(req.body, function(result) {
        if ('error' in result) {
            res.send(result.error, 401);
        } else if ('success' in result) {
            res.send(result.success);
        } else {
            res.send('Unknown error', 500);
        }
    });  
});

console.log('Serving on http://localhost:8080');
sync.listen(8080);
