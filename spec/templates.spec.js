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
    var element = _document.getElementsByTagName('div')[0],
      args = {template: 'test'},
      include = nodef.SnippetRegistry.get('include');
    spyOn(include, 'apply').andCallThrough();
    nodef.parse(_document);
    expect(include.apply).toHaveBeenCalled();
    expect(include.apply).toHaveBeenCalledWith(element, args);
    expect(_document.getElementsByTagName('body')[0].innerHTML).toEqual('bar');
  });

  it('should recursively parse the dom until all snippets are processed', function () {
    _document = jsdom('<html><body><div class="nodef:include?template=test-recurse"></div></body></html>');
    var include = nodef.SnippetRegistry.get('include');
    spyOn(include, 'apply').andCallThrough();
    nodef.parse(_document);
    expect(include.apply).toHaveBeenCalled();
    expect(include.apply.callCount).toEqual(2);
    expect(_document.getElementsByTagName('body')[0].innerHTML).toEqual('bar');
  });

});
// vim: ts=2 sts=2 sw=2 et ai
