var jsdom = require('jsdom').jsdom;
var nodef = require('/Users/andy/fun/nodef/src/snippet/include.js');

describe('The include snippet', function () {

  var _document = null;

  beforeEach(function () {
    _document = jsdom('<html><body>foo</body></html>');
  });

  it('should include the return value of the specified snippet', function () {
    function testSnippet(element, args) {
      var doc = element.ownerDocument,
        div = doc.createElement("div");
      div.innerHTML = "foo";
      return div;
    }

    var body = document.getElementsByTagName('body')[0],
      includeed = nodef.include(body, {snippet: testSnippet});
    expect(includeed.innerHTML).toEqual('foo<div>foo</div>');
  });

});
// vim: ts=2 sts=2 sw=2 et ai
