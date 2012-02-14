var fs = require("fs"),
  util = require("util"),
  dom = require("jsdom").jsdom;

function maybe(value) {
  var obj = null;
  function isEmpty() { return value === undefined || value === null }
  function nonEmpty() { return !isEmpty() }
  obj = {
    map: function (f) { return isEmpty() ? obj : maybe(f(value)) },
    getOrElse: function (n) { return isEmpty() ? n : value },
    get: function () { return value },
    isEmpty: isEmpty,
    nonEmpty: nonEmpty
  }
  return obj;
}

function when(x) {
  return function () {
    for (var i in arguments) {
      var result = arguments[i](x);
      if (result !== false) {
        return result;
      }
    }
    throw "No patterns matched when(" + util.inspect(x) + ")";
  };
}

function match(pattern) {
  return function (then) {
    return function (x) {
      var match = pattern === true ? true : pattern(x);
      return match !== false ? then(match) : false;
    }
  }
}

function some(f) {
  return function (x) { return x.nonEmpty() ? f(x.get()) : false };
}

var none = function (x) {
  return typeof x === "object" && typeof x.isEmpty === "function" && x.isEmpty();
};

var SnippetRegistry = (function () {
  var snippets = {
    include: require("./snippets/include.js"),
    surround: require("./snippets/surround.js"),
    merge_head: require("./snippets/merge_head.js"),
    merge_tail: require("./snippets/merge_tail.js")
  };

  return {

    add: function (key, snippet) {
      if (snippets[key]) {
        throw key + " already registered";
      }
      snippets[key] = snippet;
    },

    get: function (key) {
      return maybe(snippets[key]);
    },

    remove: function (key) {
      if (snippets[key]) {
        delete snippets[key];
      }
    }

  };
})();

exports.SnippetRegistry = SnippetRegistry;

function loadTemplate(name) {
  var html = fs.readFileSync("./template/" + name + ".html", "utf8");
  return html ? html.toString("utf8").replace(/\s+$/g, "") : null;
}

exports.loadTemplate = loadTemplate;

function nextSnippetTag(element) {
  var current = snippetTag(element);
  if (current.nonEmpty()) {
    return current;
  }
  for (var i = 0; i < element.childNodes.length; i++) {
    var found = nextSnippetTag(element.childNodes[i]);
    if (found.nonEmpty()) return found;
  }
  return current; // none
}

exports.nextSnippetTag = nextSnippetTag;

var snippetTagPattern = /nodef:([^?]+)(?:\?(.*))?/;

function argsHash(s) {
  return unescape(s).split("&").reduce(function (a, b) {
    var kv = b.split("=");
    if (kv[0]) {
      a[kv[0]] = kv[1];
    }
    return a;
  }, {});
}

function nodefSnippetTag(s) {
  return maybe(s.match(snippetTagPattern)).map(function (m) {
    var args = m[2] ? argsHash(m[2]): {};
    return {
      callable: m[1],
      args: args,
      toString: function () { return "[snippet." + m[1] + util.inspect(args) + "]"; }
    };
  });
}

function classAttr(element) {
  return maybe(element.getAttribute ? element.getAttribute("class") : undefined);
}

function nonEmpty(x) {
  return x && typeof x.nonEmpty === "function" && x.nonEmpty();
}

function snippetTag(element) {
  return classAttr(element).map(function (s) {
    return s.split(" ").map(nodefSnippetTag).filter(nonEmpty).map(function (x) {
      return {
        element: element,
        snippet: x.get()
      }
    })[0];
  });
}

function parsedSnippet(s) {
  return typeof s === "object" && s.snippet && s.snippet.callable ? s : false;
}

exports.parse = function (element) {
  var next = nextSnippetTag(element);
  console.log("next snippet: " + exports.dumpObj(next));
  return when(next)(
    match(some(parsedSnippet))(
      function (x) {
        return exports.parse(applySnippet(x));
      }
    ),
    match(none)(
      function () { return element.ownerDocument }
    )
  );
};

function objectSnippet(x) {
  return typeof x == "object" && typeof x.apply == "function" ? x : false;
}

function functionSnippet(x) {
  return typeof x == "function" ? x : false;
}

function stripSnippetTag(element) {
  if (element && element.setAttribute && element.getAttribute && element.removeAttribute) {
    var oldClass = element.getAttribute("class"),
      newClass = oldClass.replace(snippetTagPattern, "");
    if (newClass.length) {
      element.setAttribute("class", newClass);
    } else {
      element.removeAttribute("class");
    }
  }
  return element;
}

function applySnippet(tag) {
  var callable = tag.snippet.callable,
      el = tag.element,
      document = el.ownerDocument.documentElement,
      args = tag.snippet.args;

  return when(SnippetRegistry.get(callable))(
    match(some(objectSnippet))(
      function (o) { stripSnippetTag(o.apply(el, args)); return document }
    ),
    match(some(functionSnippet))(
      function (f) { stripSnippetTag(f(el, args)); return document }
    ),
    match(true)(
      function () { stripSnippetTag(notRegistered(el, {snippet: callable })); return document }
    )
  );
}

function notRegistered(element, args) {
  element.innerHTML = "ERROR: " + args.snippet + " snippet not registered";
  return element;
}

function filename(req) {
  var s = req.url.substr(1);
  return s.length < 1 ? "index.html" : s;
}

function hasHtmlExt(s) {
  return s.slice(-5) == ".html";
}

function withTemplate(s) {
  return function (success, fail) {
    if (!hasHtmlExt(s)) {
      fail();
    } else {
      console.log("Parsing htdocs/" + s);
      fs.readFile("htdocs/" + s, "utf8", success);
    }
  };
}

var transforms = [];

exports.appendTransform = function (f) { transforms.push(f); };

function transformTemplate(data) {
  var document = exports.parse(dom(data).documentElement);
  document = transforms.reduce(function (p, transform, i, a) {
    return transform(document);
  }, document);
  cleanUpTransforms();
  return document.innerHTML;
}

exports.transformTemplate = transformTemplate;

function cleanUpTransforms() {
  transforms = [];
}

function handleRequest(req, res, next) {
  withTemplate(filename(req))(
    function (err, data) {
      if (err) return next(err);

      res.writeHead(200, {"Content-Type": "text/html"});
      res.write(exports.transformTemplate(data));
      res.end();
    },
    next
  );
}

exports.filter = handleRequest;

function dumpObj(o) {
  if (o.isEmpty && o.isEmpty()) return "none";
  if (o.nonEmpty && o.nonEmpty()) return "some(" + dumpObj(o.get()) + ")";
  return Object.keys(o).map(function (k) {
    return k + " -> " + o[k];
  });
}

exports.dumpObj = dumpObj;

// vim: ts=2 sts=2 sw=2 et ai
