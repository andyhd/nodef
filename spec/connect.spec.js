var jsdom = require('jsdom').jsdom,
  nodef = require('nodef');

describe('Connect filter:', function () {

  it('should pass through to the next filter if the requested resource is not found', function () {
    runs(function () {
      var req = {
          url: '/foo/bar/quux'
        },
        res = {
          writeHead: jasmine.createSpy('writeHead'),
          write: jasmine.createSpy('write'),
          end: jasmine.createSpy('end')
        };
      this.next = jasmine.createSpy('next');
      nodef.filter(req, res, this.next);
    });

    waitsFor(function () {
      return this.next.wasCalled;
    }, 'next to be called', 500);
  });

  it('should rewrite the requested html page', function () {
    runs(function () {
      var req = { url: '/test.html' },
        next = function () {};
      this.res = {
        writeHead: jasmine.createSpy('writeHead'),
        write: jasmine.createSpy('write'),
        end: jasmine.createSpy('end')
      };
      this.result = '<html><body>bar</body></html>\n';
      nodef.filter(req, this.res, next);
    });

    waitsFor(function () {
      return this.res.end.wasCalled;
    }, 'response to be returned', 500);

    runs(function () {
      expect(this.res.write).toHaveBeenCalledWith(this.result);
    });
  });

});
// vim: ts=2 sts=2 sw=2 et ai
