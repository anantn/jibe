var https = require('https');
var redis = require('redis');

var client = redis.createClient();
client.on("error", function(err) {
    console.log("Error " + err);    
});

function getAppsForUser(msg, cb)
{
    // Check if audience is the dashboard we trust
    if (msg.audience != 'http://localhost') {
        cb({'error': 'Invalid audience'});
        return;
    }

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
            if (chunk.status != 'okay') {
                cb({'error': 'Invalid user'});
            } else {
                client.get(chunk.email, function(err, reply) {
                    console.log("Got apps for user " + chunk.email + ": " + reply);
                    if (!reply) reply = [];
                    cb({'success': reply});
                });
            }
        });
    });

    verify.on('error', function(e) {
        console.log('Could not make verification request ' + e.message);
    });

    verify.write(cert);
    verify.end();
}

exports.getAppsForUser = getAppsForUser;
