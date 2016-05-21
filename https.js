function needHttps(url) {
    return (url.indexOf("file:") != 0 && url.indexOf("http://127.0.0.1/") != 0 && url.indexOf("http://127.0.0.1:") != 0 && url.indexOf("http://localhost/") != 0 && url.indexOf("http://localhost:") != 0 && url.indexOf("https:") != 0);
}

function forceHttps(url) {
    var segments = url.split(":");
    segments[0] = "https";
    return segments.join(":");
}

function switchToHttps(url) {
    if (needHttps(url)) {
        return forceHttps(url);
    } else {
        return url;
    }
}

function createHiddenElement(url) {
    var element = document.createElement('a');
    element.href = url;
    return element;
}