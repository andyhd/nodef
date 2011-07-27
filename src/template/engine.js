var jsdom = require('jsdom');

function hasNodefMarker(element) {
  var classes = (element.hasAttribute("class") ? element.getAttribute("class") : "").split(" ");
  for (var i = 0, j = classes.length; i < j; i++) {
    if (classes[i].indexOf("nodef:") === 0) {
      return true;
    }
  }
  return false;
}

function recursivePreorder(element, stack) {
  if (element.nodeType == jsdom.defaultLevel.Node.ELEMENT_NODE ||
      element.nodeType == jsdom.defaultLevel.Node.DOCUMENT_NODE) {
    if (hasNodefMarker(element)) {
      stack.push(element);
    }
    for (var i = 0, j = element.childNodes.length; i < j; i++) {
      recursivePreorder(element.childNodes[i], stack);
    }
  }
}

exports.snippets = function (document) {
  var elements = [];
  recursivePreorder(document.documentElement, elements);
  return elements;
}
// vim: ts=2 sts=2 sw=2 et ai
