var nodef = require('nodef');

function testRes() {
  return {
    writeHead: jasmine.createSpy('writeHead'),
    write: jasmine.createSpy('write'),
    end: jasmine.createSpy('end')
  };
}

describe('Template Engine:', function () {

  it('should pass through to the next filter if the requested resource is not found',
    function () {
      runs(function () {
        var req = { url: '/foo/bar/quux' },
            res = testRes();
        this.next = jasmine.createSpy('next');
        nodef.filter(req, res, this.next);
      });

      waitsFor(function () {
        return this.next.wasCalled;
      }, 'next to be called', 500);
    }
  );

  it('should output a template with no nodef tags unchanged',
    function () {
      runs(function () {
        var req = { url: '/no-tags.html' },
            next = function () {};
        this.res = testRes();
        this.result = '<html><body>no nodef tags here</body></html>\n';
        nodef.filter(req, this.res, next);
      });

      waitsFor(function () {
        return this.res.end.wasCalled;
      }, 'response to be returned', 500);

      runs(function () {
        expect(this.res.write).toHaveBeenCalledWith(this.result);
      });
    }
  );

  it('should transform the nodef tagged elements in a template',
    function () {
      runs(function () {
        var req = { url: '/test.html' },
            next = function () {};
        this.res = testRes();
        this.result = '<html><body>bar</body></html>\n';
        nodef.filter(req, this.res, next);
      });

      waitsFor(function () {
        return this.res.end.wasCalled;
      }, 'response to be returned', 500);

      runs(function () {
        expect(this.res.write).toHaveBeenCalledWith(this.result);
      });
    }
  );

  it('should replace a tag with the return value of the specified snippet',
    function () {

      // register a new snippet
      nodef.SnippetRegistry.add("hello", function (el, args) {
        var nodes = el.getElementsByClassName("name"),
          document = el.ownerDocument;
        for (var i = 0; i < nodes.length; i++) {
          var text = document.createTextNode(args.name),
            parent = nodes[i].parentNode;
          parent.replaceChild(text, nodes[i]);
        }
        return el;
      });

      var input = '<html><body><div class="nodef:hello?name=foo">Hello <b class="name"/>!</div></body></html>',
          expected = '<html><body><div>Hello foo!</div></body></html>';
      expect(nodef.transformTemplate(input)).toEqual(expected);

      // tidy up
      nodef.SnippetRegistry.remove("hello");
    }
  );

  it('should display an error message if the specified snippet is not registered',
    function () {
      var input = '<html><body><div class="nodef:hello"></div></body></html>',
          expected = '<html><body><div>ERROR: hello snippet not registered</div></body></html>';
      expect(nodef.transformTemplate(input)).toEqual(expected);
    }
  );

  it("should call a snippet object's apply method",
    function () {
      var input = '<html><body><div class="nodef:hello">bar</div></body></html>',
          expected = '<html><body><div>foo</div></body></html>',
          testSnippet = {
            apply: function (el, args) {
              el.innerHTML = 'foo';
              return el;
            }
          };
      nodef.SnippetRegistry.add('hello', testSnippet);
      spyOn(testSnippet, 'apply').andCallThrough();
      expect(nodef.transformTemplate(input)).toEqual(expected);
      expect(testSnippet.apply).toHaveBeenCalled();
    }
  );

  it('should recursively parse the dom until all snippets are processed',
    function () {
      var input = '<html><body><div class="nodef:include?template=test-recurse"></div></body></html>',
          expected = '<html><body>bar</body></html>';
      expect(nodef.transformTemplate(input)).toEqual(expected);
    }
  );

});
// vim: ts=2 sts=2 sw=2 et ai
