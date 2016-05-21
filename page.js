(function () {
    document.getElementById('noscript').remove();
    document.getElementById('show-control').style.display = "";
    try {
        document.getElementById('homepage').href = switchToHttps(createHiddenElement("/").href);
    } catch (e) {}

    document.getElementById('page-number-control').onkeypress = function (e) {
        if (e.keyCode == 13) {
            jumpToPage();
        }
    }

    if (needHttps(location.href)) {
        document.getElementById('https').href = forceHttps(location.href);
        document.getElementById('insecure').style.display = "";
    }
})();

function showControl() {
    document.getElementById('show-control').style.display = "none";
    document.getElementById('page-number-control').style.display = "";
    document.getElementById('go-to-page').style.display = "";

    return false;
}

function jumpToPage() {
    var whichPage = document.getElementById('page-number-control').value;

    document.getElementById('show-control').style.display = "";
    document.getElementById('page-number-control').style.display = "none";
    document.getElementById('go-to-page').style.display = "none";

    location.href = whichPage + ".html";

    return false;
}

function ignoreHttps() {
    document.getElementById('insecure').style.display = "none";

    return false;
}