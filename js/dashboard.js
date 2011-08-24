
function login()
{
    var img = document.getElementById("button");
    img.src = "css/loader.gif";

    navigator.apps.mgmt.list(function(apps) {
        if (apps !== false) {
            var board = document.getElementById("dashboard");
            document.getElementById("login").style.display = "none";
            if (apps.length == 0) {
                document.getElementById("empty").style.display = "block";
            } else {
                document.getElementById("dashboard").style.display = "block";
                // Dashboard logic
            }
        } else {
            document.getElementById("msg").innerHTML =
                "There was an error with your login, try again!";
            img.src = "css/signin.png";
        }
    });
}
