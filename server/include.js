/* JIBE backed apps API implementation */

if (!navigator.apps) navigator.apps = {};

/* inject if navigator.apps.install isn't defined or if
     navigator.apps.html5Implementation is true    (this latter check
     works around bad firefox behavior which doesn't properly
     restoring navigator.XXX to a pristine state upon reload)
*/
if (!navigator.apps.install || navigator.apps.html5Implementation) {

    navigator.apps = (function() {

        var _callbacks = {};
        var _server = "http://localhost:8080";
        var _assertion = {'cert':null, 'time':null};
        var _iframe = document.createElement('iframe');

        /* Setup event listener for postMessage */
        window.addEventListener("message", function(event) {
            if (event.origin != _server) return;
            
            var data = JSON.parse(event.data);
            if (data.action in _callbacks && _callbacks[data.action]) {
                if ("success" in data) _callbacks[data.action](data.success);
                else _callbacks[data.action](false);
                _callbacks[data.action] = null;
            } else {
                console.log("Invalid response from postMessage! " + data);
            }
        }, false);

        /* Insert iframe from app sync server for postMessage */
        window.addEventListener("load", function() {
            _iframe.src = _server + "/include.html"
            _iframe.style.display = "none";
            document.body.appendChild(_iframe);
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
                }
            } else {
                cb(_assertion.cert);
            }
        }

        function callList(cb) {
            _doLogin(function(cert) {
                if (!cert) throw "BrowserID failed";
                _callbacks["list"] = cb;
                var msg = {"action":"list", "assertion":assertion};
                _iframe.contentWindow.postMessage(JSON.stringify(msg), _server);
            });
        }

        function callInstall(obj) {
            /* Is there a way to combine BrowserID & install prompts here? */
            _doLogin(function(cert) {
                if (!cert) throw "BrowserID failed";
                _callbacks["install"] = obj.onsuccess;
                var msg = {"action":"list", "record":{
                    "url":obj.url, "install_data":obj.install_data
                }};
                _iframe.contentWindow.postMessage(JSON.stringify(msg), _server);
            });
        }

        return {
            //install: callInstall,
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
