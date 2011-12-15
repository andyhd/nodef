var nodef = require('nodef');

this.apply = function (element, args) {

  nodef.appendTransform(function (doc) {
    var head = doc.getElementsByTagName('head')[0],
      parent = element.parentNode;

    if (element.tagName.toLowerCase() == "title") {
      var titles = head.getElementsByTagName("title");
      for (var i = 0; i < titles.length; i++) {
        head.removeChild(titles[i]);
      }
    }

    parent.removeChild(element);
    head.appendChild(element);

    return doc;
  });

  return null;

}
