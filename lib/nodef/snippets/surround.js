var nodef = require('nodef');

this.apply = function (element, args) {

  var document = element.ownerDocument;
  var template = nodef.loadTemplate(args.with);

  document.innerHTML = template;
  var target = document.getElementById(args.at);
  target.parentNode.replaceChild(element, target);

  return element;

};
