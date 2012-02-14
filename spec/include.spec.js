var nodef = require('nodef');

describe('Include snippet:', function () {

  it('should replace the tag with the parsed specified template', function () {
    var input = '<html><body><div class="nodef:include?template=test"></div></body></html>',
        expected = '<html><body>bar</body></html>';
    expect(nodef.transformTemplate(input)).toEqual(expected);
  });

  it('should include an error message if the template is not found', function () {
    var input = '<html><body><div class="nodef:include?template=non-existent"></div></body></html>',
        expected = '<html><body><div class="nodef-error">Error: Failed loading template non-existent</div></body></html>';
    expect(nodef.transformTemplate(input)).toEqual(expected);
  });

});
// vim: ts=2 sts=2 sw=2 et ai
