var jsdom = require('jsdom').jsdom;
var nodef = require('../../nodef/nodef.js');

describe('Include snippet:', function () {

  var _document = null;

  beforeEach(function () {
    _document = jsdom('<html><body><div class="nodef:include?template=test"></div></body></html>');
  });

  it('should replace the tag with the parsed specified template', function () {
    var tag = _document.getElementsByTagName('div')[0],
      body = _document.getElementsByTagName('body')[0],
      included = nodef.include(tag, {template: 'test'});
    expect(included.length).toEqual(1);
    expect(included[0].nodeName).toEqual('#text');
    expect(included[0].nodeValue).toEqual('bar');
    expect(body.innerHTML).toEqual('bar');
  });

  it('should include an error message if the template is not found', function () {
    var body = _document.getElementsByTagName('body')[0],
      tag = _document.getElementsByTagName('div')[0],
      included = nodef.include(tag, {template: 'non-existent'});
    expect(body.innerHTML).toEqual('<div class="nodef-error">non-existent template not found</div>');
  });

});
// vim: ts=2 sts=2 sw=2 et ai
