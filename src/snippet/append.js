var fs = require('fs'),
    jsdom = require('jsdom').jsdom;

function loadTemplate(filename) {
    var html = fs.readFile(filename, 'utf8');
    if (data) {
        var el = jsdom(data.toString('utf8'));
    }
}

function parseTemplate(template) {
}

exports.append = function (element, args) {

    if (args.template) {
        element.appendChild(parseTemplate(args.template));
    }

    element.appendChild(template);
    return element;

};
