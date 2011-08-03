var fs = require('fs'),
  jsdom = require('jsdom');

function loadTemplate(name) {
  var html = fs.readFileSync("./template/" + name + ".html", 'utf8');
  if (html) {
    return html.toString('utf8').replace(/\s+$/g, '');
  }
  return null;
}

exports.loadTemplate = loadTemplate;

exports.include = function (element, args) {
  if (args.template) {
    var src = "";
    try {
      src = loadTemplate(args.template);
    } catch (err) {
      src = '<div class="nodef-error">' + args.template + " template not found</div>";
    }
    if (src) {
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
      for (var i = 0, j = pairs.length; i < j; i++) {
        var pair = pairs[i].split("=");
        if (pair[0]) {
          args[pair[0]] = pair[1];
        }
      }
    }
    return {
      tag: match[0],
      callable: match[1],
      args: args
    };
  }
  return null;
}

function parsedSnippet(element) {
  var classAttr = element.getAttribute("class"),
    classes = (classAttr ? classAttr.split(" ") : []),
    snippets = [];
  for (var i = 0, j = classes.length; i < j; i++) {
    var snippet = parseNodefTag(classes[i]);
    if (snippet) {
      element.setAttribute("class", classAttr.replace(snippet.tag, ""));
      if (element.getAttribute("class").length < 1) {
        element.removeAttribute("class");
      }
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
    },

    remove: function (key) {
      if (snippets[key]) {
        delete snippets[key];
      }
    }

  };
})();

exports.SnippetRegistry = SnippetRegistry;

function notRegistered(element, args) {
  element.innerHTML = "ERROR: " + args.snippet + " snippet not registered";
  return element;
}

exports.parse = function (document) {
  var tags = exports.snippetTags(document);
  if (tags.length == 0) {
    return;
  }
  for (var i = 0, j = tags.length; i < j; i++) {
    var tag = tags[i],
      snippet = SnippetRegistry.get(tag.snippet.callable);
    if (snippet) {
      if (typeof(snippet) == 'object' && snippet.apply && typeof(snippet.apply) == 'function') {
        snippet.apply(tag.element, tag.snippet.args);
      } else if (typeof(snippet) == 'function') {
        snippet(tag.element, tag.snippet.args);
      }
    } else {
      notRegistered(tag.element, {snippet: tag.snippet.callable})
    }
  }
  exports.parse(document);
}

exports.filter = function (req, res, next) {

  fs.readFile('htdocs/' + req.url.substr(1), 'utf8', function (err, data) {
    if (err) {
      next(err);
      return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    var document = jsdom.jsdom(data);
    exports.parse(document);
    res.write(document.innerHTML);
    res.end();
  });

};

// vim: ts=2 sts=2 sw=2 et ai
