(function () {
    if (needHttps(location.href)) {
        document.getElementById('https').href = forceHttps(location.href);
        document.getElementById('insecure').style.display = "inline";
    }
})();