var jsdom = require('jsdom').jsdom,
  nodef = require('../../nodef/nodef.js');

describe('Template engine:', function () {

  var _document = null;

  beforeEach(function () {
    _document = jsdom('<html><body><div class="nodef:include?template=test"></div></body></html>');
  });

  it('should recognise nodef namespaced class attributes', function () {
    var snippets = nodef.snippetTags(_document);
    expect(snippets.length).toEqual(1);
    expect(snippets[0].element.tagName).toEqual("DIV");
    expect(snippets[0].element.getAttribute("class").indexOf("nodef:")).toEqual(0);
  });

  it('should call the snippet named in the nodef marker', function () {
    if (!nodef.include) {
      nodef.include = function (element, args) {};
    }
    spyOn(nodef, 'include');
    var parsed = nodef.parse(_document);
    expect(nodef.include).toHaveBeenCalled();
  });

});
