var loadTemplate = require('nodef').loadTemplate;

function replaceElement(replacement, element) {
  var parent = element.parentNode;

  // if the replacement is a nodelist
  if (replacement.length) {

    // insert each node
    var inserted = [];
    for (var i = 0; i < replacement.length; i++) {
      inserted.push(parent.insertBefore(replacement[i], element));
    }

    // remove the element
    parent.removeChild(element);

    // get the inserted nodes again
    return inserted;

  }

  // replace the old element with the new one
  parent.replaceChild(replacement, element);

  return replacement;
}

function error(msg, document) {
  var div = document.createElement('div');
  div.setAttribute('class', 'nodef-error');
  div.innerHTML = msg;
  return div;
}

function parseTemplate(template, document) {
  var div = document.createElement('div');
  try {
    div.innerHTML = loadTemplate(template);
  } catch (e) {
    return error(template + " template not found", document);
  }

  return div.childNodes;
}

this.apply = function (element, args) {
  var document = element.ownerDocument;
  if (args.template) {
    var replacement = parseTemplate(args.template, document);
    return replaceElement(replacement, element)
  }
  return error("No template specified to include", document);
};
