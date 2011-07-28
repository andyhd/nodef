var jsdom = require('jsdom').jsdom,
  nodef = require('../nodef/nodef.js');

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
    spyOn(nodef, 'include').andCallThrough();
    var element = _document.getElementsByTagName('div')[0],
      parsed = nodef.parse(_document),
      args = {template: 'test'};
    expect(nodef.include).toHaveBeenCalled();
    expect(nodef.include).toHaveBeenCalledWith(element, args);
    expect(_document.getElementsByTagName('body')[0].innerHTML).toEqual('bar');
  });

  it('should recursively parse the dom until all snippets are processed', function () {
    _document = jsdom('<html><body><div class="nodef:include?template=test-recurse"></div></body></html>');
    spyOn(nodef, 'include').andCallThrough();
    var parsed = nodef.parse(_document);
    expect(nodef.include).toHaveBeenCalled();
    expect(nodef.include.callCount).toEqual(2);
    expect(_document.getElementsByTagName('body')[0].innerHTML).toEqual('bar');
  });

});
// vim: ts=2 sts=2 sw=2 et ai
