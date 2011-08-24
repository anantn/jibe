/* JIBE backed apps API implementation */

if (!navigator.apps) navigator.apps = {};

/* inject if navigator.apps.install isn't defined or if
     navigator.apps.html5Implementation is true    (this latter check
     works around bad firefox behavior which doesn't properly
     restoring navigator.XXX to a pristine state upon reload)
*/
if (!navigator.apps.install || navigator.apps.html5Implementation) {

    navigator.apps = (function() {

        /* Setup event listener for postMessage */
        window.addEventListener("message", function(event) {
            
        }, false);

        /* Insert iframe from app sync server for postMessage */
        var _callbacks = {};
        var _iframe = document.createElement('iframe');
        window.addEventListener("load", function() {
            _iframe.src = "http://localhost:8080/include.html"
            _iframe.style.display = "none";
            document.body.appendChild(_iframe);
        }, false);

        function callList(cb) {
            var iframe = _iframe;
            var callbacks = _callbacks;

            navigator.id.getVerifiedEmail(function(assertion) {
                if (assertion) {
                    callbacks["list"] = cb;
                    var msg = {"action":"list", "assertion":assertion};
                    iframe.contentWindow.postMessage(JSON.stringify(msg), "http://localhost:8080");
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
