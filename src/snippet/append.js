var fs = require('fs'),
    jsdom = require('jsdom').jsdom;

function loadTemplate(name) {
    var html = fs.readFileSync("./template/" + name + ".html", 'utf8');
    if (html) {
        return html.toString('utf8').replace(/\s+$/g, '');
    }
    return null;
}

exports.append = function (element, args) {

    if (args.template) {
        var src = "";
        if (src = loadTemplate(args.template)) {
            var doc = element.ownerDocument,
                div = doc.createElement("div");
            div.innerHTML = src;
            for (var i = 0, j = div.childNodes.length; i < j; i++) {
                element.appendChild(div.childNodes[i]);
            }
        }
    }

    return element;

};
