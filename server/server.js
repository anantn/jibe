var https = require('https');
var express = require('express');

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

sync.post('/repo/list', function(req, res) {
    var msg = req.body;

    // Check if audience is the dashboard we trust
    if (msg.audience != 'http://localhost') {
        res.send('Invalid audience', 401);
    } else {

        var cert = 'assertion=' + encodeURIComponent(msg.assertion) + '&audience=localhost';
        var options = {
            host: 'browserid.org',
            path: '/verify',
            method: 'POST',
            headers: {
                'content-type': 'application/x-www-form-urlencoded',
                'content-length': '' + cert.length
            }
        };

        var verify = https.request(options, function(response) {
            response.setEncoding('utf8');
            response.on('data', function(chunk) {
                chunk = JSON.parse(chunk);
                if (chunk.status != "okay") {
                    res.send('Invalid user', 401);
                } else {
                    res.send('App list for ' + chunk.email);
                }
            });
        });

        verify.on('error', function(e) {
            console.log('Could not make verification request ' + e.message);
        });

        verify.write(cert);
        verify.end();
    }
});

sync.listen(8080);
