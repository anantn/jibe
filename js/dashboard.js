
function empty(o)
{
    for (var i in o) 
        if (o.hasOwnProperty(i))
            return false;
    return true;
}

function login()
{
    var img = document.getElementById("button");
    img.src = "css/loader.gif";

    navigator.apps.mgmt.list(function(apps) {
        if (apps !== false) {
            var board = document.getElementById("dashboard");
            document.getElementById("login").style.display = "none";

            if (empty(apps)) {
                document.getElementById("empty").style.display = "block";
                var candidates = document.getElementsByClassName("app");
                for (var i = 0; i < candidates.length; i++) {
                    var app = candidates[i];
                    var manifest = app.getAttribute("manifest");

                    function makeInstallFunc(appSpan, manifest)
                    {
                        return function() {
                            navigator.apps.install({
                                url: manifest,
                                install_data: {},
                                onsuccess: function(done) {
                                    appSpan.style.display = "none";
                                },
                                onerror: function(err) {
                                    alert("Oh no, there was an error " + err);
                                }
                            });
                        }
                    };
                    app.onclick = makeInstallFunc(app, manifest);
                }
            } else {
                // Dashboard logic. IconGrid.js can come in handy!
                function getIconForSize(targetSize, minifest)
                {
                    if (minifest && minifest.icons) {
                        var bestFit = 0;
                        var biggestFallback = 0;
                        for (var z in minifest.icons) {
                            var size = parseInt(z, 10);
                            if (bestFit == 0 || size >= targetSize) {
                                bestFit = size;
                            }
                            if (biggestFallback == 0 || size > biggestFallback) {
                                biggestFallback = size;
                            }
                        }
                        if (bestFit !== 0) return minifest.icons[bestFit];
                        if (biggestFallback !== 0) return minifest.icons[biggestFallback];
                    }
                }
                
                function makeLaunchFunction(url)
                {
                    return function() {
                        window.open(url);
                    }
                }

                /* IconGrid */
                var appData = {
                    getItemList: function(cb) {
                        var list = {};
                        for (var origin in apps) {
                            var app = apps[origin];
                            list[origin] = {
                                itemTitle: app.manifest.name,
                                itemImgURL: origin + getIconForSize(48, app.manifest)
                            };
                        }
                        cb(list);
                    },
                    openItem: function(itemID) {
                        var url = itemID;
                        var app = apps[itemID];
                        if ('launch_path' in app.manifest) {
                            url += app.manifest.launch_path;
                        }
                        window.open(url);
                    }
                };
                var grid = $("#apps");
                document.getElementById("dashboard").style.display = "block";
                var gridLayout = new GridLayout(grid.width(), grid.height(), 6, 3);
                var gridDash = new IconGrid("appDashboard", grid, appData, gridLayout);

                gridDash.initialize();
                gridDash.refresh();

                /*
                var grid = document.getElementById("apps");
                document.getElementById("dashboard").style.display = "block";
                for (var origin in apps) {
                    var app = apps[origin];
                    var appSpan = document.createElement("span");
                    appSpan.setAttribute("class", "app");
                    var appIcon = document.createElement("img");
                    appIcon.src = origin + getIconForSize(48, app.manifest);
                    var appName = document.createElement("div");
                    appName.setAttribute("class", "name");
                    appName.innerHTML = app.manifest.name;

                    appSpan.appendChild(appIcon);
                    appSpan.appendChild(appName);
                    grid.appendChild(appSpan);

                    var url = origin;
                    if ('launch_path' in app.manifest) {
                        url += app.manifest.launch_path;
                    }
                    appSpan.onclick = makeLaunchFunction(url);
                }
                */
            }
        } else {
            document.getElementById("msg").innerHTML =
                "There was an error with your login, try again!";
            img.src = "css/signin.png";
        }
    });
}
