var nodef = require('nodef');

this.apply = function (element, args) {

  nodef.appendTransform(function (doc) {
    var body = doc.getElementsByTagName('body')[0],
      parent = element.parentNode;

    parent.removeChild(element);
    body.appendChild(element);

    return doc;
  });

  return null;

}
