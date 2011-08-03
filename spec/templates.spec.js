var jsdom = require('jsdom').jsdom,
  nodef = require('nodef');

describe('Template engine:', function () {

  var _document = null;

  beforeEach(function () {
    _document = jsdom('<html><body><div class="nodef:include?template=test"></div></body></html>');
  });

  it('should load the named template from the configured templates directory', function () {
    var html = nodef.loadTemplate('test');
    expect(html).toEqual('bar');
  });

  it('should return null if the named template is not found', function () {
    var err = "EBADF, Bad file descriptor './template/non-existent.html'";
    expect(function () {nodef.loadTemplate('non-existent')}).toThrow(err);
  });

  it('should recognise nodef namespaced class attributes', function () {
    var tags = nodef.snippetTags(_document);
    expect(tags.length).toEqual(1);
    expect(tags[0].element.tagName).toEqual("DIV");
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
