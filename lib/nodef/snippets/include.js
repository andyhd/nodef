var nodef = require("nodef");

function replaceWithTemplate(element, template, replaceInto) {
  var parent = element.parentNode,
    div = element.ownerDocument.createElement("div");

  try {
    div.innerHTML = nodef.loadTemplate(template);
  } catch (e) {
    return error("Error: Failed loading template " + template, element);
  }

  // replace element with loaded template
  parent.replaceChild(div, element);

  // remove containing element, unless replaceInto
  if (replaceInto !== true) {
    div = unwrap(div);
  }

  return div;
}

function unwrap(element) {
  var inserted = element.ownerDocument.createDocumentFragment(),
    parent = element.parentNode
    children = element.childNodes;

  while (element.firstChild) {
    inserted.appendChild(element.firstChild);
  }

  parent.insertBefore(inserted, element);
  parent.removeChild(element);

  return children;
}

function error(msg, element) {
  var div = element.ownerDocument.createElement('div');
  div.setAttribute('class', 'nodef-error');
  div.innerHTML = msg;
  element.parentNode.replaceChild(div, element);
  return div;
}

this.apply = function (element, args) {
  return args.template
    ? replaceWithTemplate(element, args.template, args.replaceInto)
    : error("Error: No template specified to include", element);
};
