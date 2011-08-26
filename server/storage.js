var https = require('https');
var redis = require('redis');

var client = redis.createClient();
client.on("error", function(err) {
    console.log("Error " + err);    
});

function verifyBrowserID(assertion, cb)
{
    // Audience hardcoded to localhost, needs to change
    var cert = 'assertion=' + encodeURIComponent(assertion) + '&audience=localhost';
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
                cb({'success': chunk.email});
            }
        });
    });

    verify.on('error', function(e) {
        console.log('Could not make verification request ' + e.message);
    });

    verify.write(cert);
    verify.end();
}

function getAppsForUser(msg, cb)
{
    // FIXME: msg.audience is unused
    verifyBrowserID(msg.assertion, function(ret) {
        if ('success' in ret) {
            var email = ret['success'];
            client.get(email, function(err, reply) {
                if (err) {
                    cb({'error': err});
                } else {
                    if (!reply) reply = "{}";
                    cb({'success': JSON.parse(reply)});
                }
            });
        } else {
            cb(ret);
        }
    });
}

function installAppForUser(msg, cb)
{
    verifyBrowserID(msg.assertion, function(ret) {
        if ('success' in ret) {
            var email = ret['success'];
            client.get(email, function(err, reply) {
                if (err) {
                    cb({'error': err});
                } else {
                    if (!reply) reply = "{}";
                    
                    var apps = JSON.parse(reply);
                    apps[msg.appOrigin] = {
                        manifest: msg.manifest,
                        installData: msg.installData,
                        installOrigin: msg.installOrigin
                    };
                    client.set(email, JSON.stringify(apps), function(err, reply) {
                        if (err) {
                            cb({'error': err});
                        } else {
                            cb({'success': msg.appOrigin});
                        }
                    });
                }
            });
        } else {
            cb(ret);
        }
    });
}

exports.getAppsForUser = getAppsForUser;
exports.installAppForUser = installAppForUser;
