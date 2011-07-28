var fs = require('fs'),
  jsdom = require('jsdom');

function loadTemplate(name) {
  try {
    var html = fs.readFileSync("./template/" + name + ".html", 'utf8');
    if (html) {
      return html.toString('utf8').replace(/\s+$/g, '');
    }
  } catch(err) {
    return '<div class="nodef-error">' + name + " template not found</div>";
  }
  return null;
}

exports.include = function (element, args) {

  if (args.template) {
    var src = "";
    if (src = loadTemplate(args.template)) {
      var doc = element.ownerDocument,
        parent = element.parentNode,
        div = doc.createElement("div"),
        out = [];
      div.innerHTML = src;
      for (var i = 0, j = div.childNodes.length; i < j; i++) {
        out[out.length] = div.childNodes[i];
        parent.insertBefore(div.childNodes[i], element);
      }
      parent.removeChild(element);
      return out;
    }
  }

  return element;

};
function parseNodefTag(tag) {
  var match = tag.match(/nodef:([^?]+)(?:\?(.*))?/),
    args = {};

  if (match) {
    if (match[2]) {
      var pairs = unescape(match[2]).split("&");
      for (var i in pairs) {
        var pair = pairs[i].split("=");
        if (pair[0]) {
          args[pair[0]] = pair[1];
        }
      }
    }
    return {
      callable: match[1],
      args: args
    };
  }
  return null;
}

function parsedSnippet(element) {
  var classes = (element.hasAttribute("class") ? element.getAttribute("class") : "").split(" "),
    snippets = [];
  for (var i in classes) {
    var snippet = parseNodefTag(classes[i]);
    if (snippet) {
      return {
        element: element,
        snippet: snippet
      };
    }
  }
  return null;
}

function recursivePreorder(element, stack) {
  if (element.nodeType == jsdom.defaultLevel.Node.ELEMENT_NODE ||
      element.nodeType == jsdom.defaultLevel.Node.DOCUMENT_NODE) {
    var snippet = parsedSnippet(element);
    if (snippet) {
      stack.push(snippet);
    }
    for (var i = 0, j = element.childNodes.length; i < j; i++) {
      recursivePreorder(element.childNodes[i], stack);
    }
  }
}

exports.snippetTags = function (document) {
  var tags = [];
  recursivePreorder(document.documentElement, tags);
  return tags;
}

var SnippetRegistry = (function () {
  var snippets = {
    include: function (element, args) { return exports.include(element, args); }
  };

  return {

    add: function (key, snippet) {
      if (snippets[key]) {
        throw key + " already registered";
      }
      snippets[key] = snippet;
    },

    get: function (key) {
      return snippets[key];
    }

  };
})();

exports.parse = function (document) {
  var tags = exports.snippetTags(document);
  if (tags.length == 0) {
    return;
  }
  for (var i in tags) {
    var tag = tags[i],
      snippet = SnippetRegistry.get(tag.snippet.callable);
    if (snippet) {
      if (typeof(snippet) == 'object' && snippet.apply && typeof(snippet.apply) == 'function') {
        snippet.apply(tag.element, tag.snippet.args);
      } else if (typeof(snippet) == 'function') {
        snippet(tag.element, tag.snippet.args);
      }
    }
  }
  exports.parse(document);
}
// vim: ts=2 sts=2 sw=2 et ai
