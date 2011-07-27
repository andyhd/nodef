var fs = require('fs'),
  jsdom = require('jsdom').jsdom;

function loadTemplate(name) {
  try {
    var html = fs.readFileSync("./template/" + name + ".html", 'utf8');
    if (html) {
      return html.toString('utf8').replace(/\s+$/g, '');
    }
  } catch(err) {
    return '<div class="nodef-error">' + name + " template not found</div>";
  }
  return null;
}

exports.include = function (element, args) {

  if (args.template) {
    var src = "";
    if (src = loadTemplate(args.template)) {
      var doc = element.ownerDocument,
        parent = element.parentNode,
        div = doc.createElement("div"),
        out = [];
      div.innerHTML = src;
      for (var i = 0, j = div.childNodes.length; i < j; i++) {
        out[out.length] = div.childNodes[i];
        parent.insertBefore(div.childNodes[i], element);
      }
      parent.removeChild(element);
      return out;
    }
  }

  return element;

};
// vim: ts=2 sts=2 sw=2 et ai
