var jsdom = require('jsdom').jsdom,
  nodef = require('nodef');

describe('User Defined Snippet:', function () {

  var _document = null;

  beforeEach(function () {
    _document = jsdom('<html><body><div class="nodef:hello?name=foo">Hello <b class="name">World</b>!</div></body></html>');
  });

  it('should include the return value of the specified snippet', function () {

    function hello(element, args) {
      var nodes = element.getElementsByClassName("name"),
        document = element.ownerDocument;
      for (var i = 0; i < nodes.length; i++) {
        var text = document.createTextNode(args.name),
          parent = nodes[i].parentNode;
        parent.replaceChild(text, nodes[i]);
      }
      return element;
    }

    nodef.SnippetRegistry.add("hello", hello);

    var body = _document.getElementsByTagName('body')[0];
    nodef.parse(_document);
    expect(body.innerHTML).toEqual('<div>Hello foo!</div>');

    nodef.SnippetRegistry.remove("hello");
  });

  it('should display an error message if the specified snippet is not registered', function () {
    var body = _document.getElementsByTagName('body')[0];
    nodef.parse(_document);
    expect(body.innerHTML).toEqual('<div>ERROR: hello snippet not registered</div>');
  });

  it('should call a snippet object\'s apply method', function () {
    var div = _document.getElementsByTagName('div')[0],
      testSnippet = {
        apply: function (elem, args) {
          elem.innerHTML = 'foo';
          return elem;
        }
      };
    nodef.SnippetRegistry.add("hello", testSnippet);
    spyOn(testSnippet, 'apply').andCallThrough();
    nodef.parse(_document);
    expect(testSnippet.apply).toHaveBeenCalled();
    expect(div.innerHTML).toEqual('foo');
  });

});
// vim: ts=2 sts=2 sw=2 et ai
