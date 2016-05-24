(function () {
    document.getElementById('homepage').href = switchToHttps(createHiddenElement("/").href);
    document.getElementById('search-all').href = switchToHttps(createHiddenElement("").href);

    window.Synonyms = [
        [/老*综(1|一)/g, "综合"],
        [/(二|2)创/g, "二次创作"], ["2次创作", "二次创作"],
        [/2次(元*)/g, "二次$1"], [/3次(元*)/g, "3二次$1"],
        [/(.+)菌/g, "$1君"]
    ];

    stupidChrome();

    addAdditionalTags();

    searchBox = document.getElementById('search-box');
    searchButton = document.getElementById('search-button');

    searchBox.oninput = function () {
        showSearchResults(searchBox.value);
    }
    searchButton.onclick = function () {
        changeHash(searchBox.value);
    }
    searchBox.onkeypress = function (e) {
        if (e.keyCode == 13) {
            changeHash(searchBox.value);
        }
    }

    window.onhashchange = checkHash;

    checkHash();
})();

function stupidChrome() {
    if (HTMLCollection.prototype[Symbol.iterator] == undefined) {
        HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
    }
}

function changeHash(keyword) {
    if (!isNonsense(keyword)) {
        location.hash = "#q=" + keyword;
    }
}

function checkHash() {
    hash = location.hash;
    if (hash.indexOf("#q=") == 0) {
        searchBox.value = decodeURIComponent(hash.substring(3));
        searchBox.blur();
        showSearchResults(searchBox.value);
    } else {
        searchBox.value = "";
        restore();
        searchBox.focus();
    }
}

function addAdditionalTags() {
    subList = document.getElementsByClassName('sub');
    for (subBlock of subList) {
        name = subBlock.getAttribute('data-name');

        trList = subBlock.getElementsByTagName('tr');
        for (tr of trList) {
            oldTags = tr.getAttribute('data-tags');
            tr.setAttribute('data-tags', oldTags ? (oldTags + " " + name) : name);
        }
    }
}

function showSearchResults(keyword) {
    if (isNonsense(keyword)) {
        restore();
        return;
    }

    leaveSpaceForResults();

    results = [];

    subs = document.getElementsByClassName('sub');
    for (var subBlock of subs) {
        incompleteResults = searchSubBlock(keyword, subBlock);
        results = results.concat(incompleteResults);
    }

    resultsPlaceHolder = document.getElementById('relevant-results');

    if (results.length == 0) {
        resultsPlaceHolder.style.display = "none";
        document.getElementById('no-match').style.display = "";
    } else {
        resultsPlaceHolder.innerHTML = "";

        results = results.sort(sortResults);
        for (var rank_div of results) {
            resultsPlaceHolder.appendChild(rank_div[1]);
        }

        resultsPlaceHolder.style.display = "";
    }
}

function searchSubBlock(keyword, subBlock) {
    var relevantTrs = searchTrs(keyword, subBlock);

    if (relevantTrs.length == 0) {
        return [];
    }

    var subBlockClone = cloneSubBlock(subBlock);
    var subBlockTable = subBlockClone.getElementsByClassName('threads')[0];

    for (var rank_tr of relevantTrs) {
        subBlockTable.innerHTML += rank_tr[1].outerHTML;
    }

    var highestRank = relevantTrs[0][0];

    return [[highestRank, subBlockClone]];
}

function searchTrs(keyword, subBlock) {
    list = [];

    wordList = breakWords(keyword);
    if (wordList.length == 0) {
        return [];
    }
    words = wordList.join(' ');

    allTrs = subBlock.getElementsByTagName('tr');
    for (var tr of allTrs) {
        tags = getAttr(tr.attributes['data-tags']).toLowerCase().trim();
        tagList = tags.split(' ').filter(function (e) {
            return e != "";
        });

        pinyin = getAttr(tr.attributes['data-pinyin']).toLowerCase().trim();
        pinyinList = pinyin.split(' ').filter(function (e) {
            return e != "";
        });

        innerText = tr.textContent.toLowerCase();

        rank = 0;

        for (var word of wordList) {
            if (innerText.indexOf(word) >= 0) {
                rank += 10;
            } else if (tagList.indexOf(word) >= 0) {
                rank += 20;
            } else if (tags.indexOf(word) >= 0) {
                rank += 10;
            }
        }

        for (var tag of tagList) {
            if (words.indexOf(tag) >= 0) {
                rank += 15;
            }
        }

        for (var sound of pinyinList) {
            if (words.endsWith(sound)) {
                rank += 5;
            } else if (words.indexOf(sound) >= 0) {
                rank += 3;
            } else {
                for (var i = sound.length - 1; i >= 2; i--) {
                    if (words.endsWith(sound.substring(0, i))) {
                        rank += Math.min(2, i);
                        break;
                    }
                }
            }
        }

        if (rank > 0) {
            list.push([rank, tr]);
        }
    }

    return list.sort(sortResults);
}

function breakWords(keyword) {
    str = keyword.toLowerCase();
    str = str.replace(/^(\s)*>+|\s|\,|\\|\||\+|@|;|，|。|、|；|｜|＋/g, ' ');
    str = str.trim();

    additional = [];

    wordList = str.split(' ').map(function (e) {
        var word = e;
        var regexGroups = word.match(/^no.(\d+)$/i);
        if (regexGroups != null) {
            if (regexGroups.length == 2) {
                number = parseInt(regexGroups[1]);
                additional.push("/" + number);
                additional.push("/" + number + "/");
            }
        } else if (word.endsWith("串") && word.length > 1) {
            word = word.substring(0, word.length - 1)
        } else if (word.endsWith("版") && word.length > 1) {
            word = word.substring(0, word.length - 1)
        } else if (word.endsWith("po") && word.length > 2) {
            word = word.substring(0, word.length - 2)
        }
        var synonym = replaceSynonym(word);
        if (synonym != word) {
            additional.push(synonym);
        }
        return word;
    }).concat(additional).filter(function (f) {
        return f != "";
    });

    return wordList;
}

function isNonsense(keyword) {
    return keyword.trim() == "";
}

function replaceSynonym(word) {
    for (var w of window.Synonyms) {
        if (typeof w[0] == "string") {
            if (word == w[0]) {
                return w[1];
            }
        } else if (typeof w[0] == "object") {
            if (w[0].test(word)) {
                return word.replace(w[0], w[1]);
            }
        }
    }

    return word;
}

function cloneSubBlock(subBlock) {
    var div = document.createElement('div');
    div.setAttribute('class', 'center-page');
    div.innerHTML = subBlock.innerHTML;
    div.getElementsByClassName('threads')[0].innerHTML = "";

    return div;
}

function getAttr(attribute) {
    if (attribute == undefined) {
        return "";
    }

    return attribute.value;
}

function sortResults(a, b) {
    return b[0] - a[0];
}

function restore() {
    document.getElementById('no-match').style.display = "none";
    document.getElementById('relevant-results').style.display = "none";
    document.getElementById('full-list').style.display = "";
}

function leaveSpaceForResults() {
    document.getElementById('no-match').style.display = "none";
    document.getElementById('relevant-results').style.display = "";
    document.getElementById('full-list').style.display = "none";
}