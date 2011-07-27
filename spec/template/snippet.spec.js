var jsdom = require('jsdom').jsdom,
  nodef = require('../../src/template/engine.js');

describe('Template engine:', function () {

  var _document = null;

  beforeEach(function () {
    _document = jsdom('<html><body><div class="nodef:include?template=test"></div></body></html>');
  });

  it('should recognize nodef namespaced class attributes', function () {
      var snippets = nodef.snippets(_document);
      expect(snippets.length).toEqual(1);
      expect(snippets[0].tagName).toEqual("DIV");
      expect(snippets[0].getAttribute("class").indexOf("nodef:")).toEqual(0);
  });

});
