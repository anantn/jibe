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

        function callList(cb) {
            navigator.id.getVerifiedEmail(function(assertion) {
                if (assertion) {
                    _callbacks["list"] = cb;
                    var msg = {"action":"list", "assertion":assertion};
                    _iframe.contentWindow.postMessage(JSON.stringify(msg), _server);
                } else {
                    cb(false);
                }
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
