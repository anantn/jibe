/* JIBE backed apps API implementation */

if (!navigator.apps) navigator.apps = {};

/* inject if navigator.apps.install isn't defined or if
     navigator.apps.html5Implementation is true    (this latter check
     works around bad firefox behavior which doesn't properly
     restoring navigator.XXX to a pristine state upon reload)
*/
if (!navigator.apps.install || navigator.apps.html5Implementation) {

    navigator.apps = (function() {

        var _channel = null;
        var _server = "http://jibe.kix.in:8080";
        var _assertion = {'cert':null, 'time':null};
        var _iframe = document.createElement('iframe');

        /* Insert iframe from app sync server for postMessage */
        window.addEventListener("load", function() {
            _iframe.src = _server + "/include.html";
            _iframe.style.display = "none";
            document.body.appendChild(_iframe);
            
            _channel = Channel.build({
                window: _iframe.contentWindow,
                origin: "*",
                scope: "openwebapps"
            });
        }, false);

        /* Get a BrowserID assertion if we haven't got one for 5 mins */
        function _doLogin(cb) {
            if (!_assertion.cert ||
                (_assertion.time && (Date.now() - _assertion.time > 300000))) {
                navigator.id.getVerifiedEmail(function(ret) {
                    if (ret) {
                        _assertion.cert = ret;
                        _assertion.time = Date.now();
                        cb(_assertion.cert);
                    } else {
                        cb(false);
                    }
                });
            } else {
                cb(_assertion.cert);
            }      
        }

        function getAudience() {
            return location.host + (location.port ? ':' + location.port : '');
        }

        function callList(cb) {
            _doLogin(function(cert) {
                if (!cert) throw "BrowserID login failed";
                _channel.call({
                    method: "list",
                    params: {assertion: cert, audience: getAudience()},
                    success: function(ret) {
                        // Wut?
                        cb(JSON.parse(ret));
                    },
                    error: function(err, msg) {
                        console.log("Error .list is " + err + " with " + msg);
                    }
                });
            });
        }

        function callInstall(obj) {
            /* Is there a way to combine BrowserID & install prompts here? */
            _doLogin(function(cert) {
                if (!cert) throw "BrowserID login failed";
                _channel.call({
                    method: "install",
                    params: JSON.stringify({
                        url: obj.url,
                        origin: window.location.toString(),
                        installData: obj.install_data,
                        assertion: cert,
                        audience: getAudience()
                    }),
                    success: function(ret) {
                        obj.onsuccess(ret);
                    },
                    error: function(err, msg) {
                        obj.onerror(msg);
                        console.log("Error .install is " + err + " with " + msg);
                    }
                });
            });
        }

        return {
            install: callInstall,
            //amInstalled: callAmInstalled,
            mgmt: {
                //launch: callLaunch,
                //loadState: callLoadState,
                list: callList,
                //uninstall: callUninstall,
                //saveState: callSaveState
            },
            html5Implementation: true
        };

    })();
}
