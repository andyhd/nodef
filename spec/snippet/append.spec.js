var jsdom = require('jsdom').jsdom;
var nodef = require('/Users/andy/fun/nodef/src/snippet/append.js');

describe('append spec', function () {

    var document = jsdom('<html><body></body></html>');

    it('should parse specified template', function () {
        var body = document.getElementsByTagName('body')[0],
            appended = nodef.append(body, {template: 'test'});
        expect(appended.innerHTML).toEqual('bar');
    });

});
