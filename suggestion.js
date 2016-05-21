(function () {
    document.getElementById('home').href = switchToHttps(createHiddenElement("/").href);

    var suggestedUrl = suggest(location.href);
    if (suggestedUrl == null) {
        return;
    }

    var element = document.getElementById('suggestedUrl');
    element.textContent = suggestedUrl[0];
    element.href = suggestedUrl[1];
    document.getElementById('suggestion').style.display = "";
})();

function suggest(locationHref) {
    if (locationHref == null) {
        return null;
    }

    url = locationHref.trim().toLowerCase();

    if (url == "") {
        return null;
    }

    veryValid = /\/+(t|r)\/+\d{3,}($|(\/|#|\?|&)+$|\/+(((\d+|index)\.html)|thumbnail.*|large.*))/g.test(url);
    if (veryValid) {
        return null;
    }

    regResult = /\/(t|r)(\/|\?|&|#|=)*(\d{3,})(\/|\?|&|#|=|\.[a-z0-9]+)+(\d+)(\/|\?|&|#|=|\.[a-z0-9]+)*/g.exec(url);
    if (!(regResult == null || regResult.length < 7)) {
        return formUrl(regResult[1], regResult[3] + "/" + regResult[5] + ".html");
    }

    regResult = /\/(t|r)(\/|\?|&|#|=)*(\d{3,})/g.exec(url);
    if (!(regResult == null || regResult.length < 4)) {
        return formUrl(regResult[1], regResult[3] + "/");
    }

    return null;
}

function formUrl(sub, subsub) {
    var relativeUrl = "/" + sub + "/" + subsub;
    var element = createHiddenElement(relativeUrl);
    return [relativeUrl, switchToHttps(element.href)];
}