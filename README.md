# Nodef #

## Features ##

* Simple JSON routing config
* Template inheritance
* Lift style snippets
* I10N

## Routing ##

### Flow ###

  1. If requested URL matches route, execute handler
  2. If a template exists for the URL, render it
  3. Show a 404

### Config ###

Example:

    routes = {
        "/images/*": { static: true },
        "/books": { action: book_handler },
        "/books": { action: book_handler, method: "POST" },
        "/books/id": { action: library.book },
        "/books/:id/page/:num": { action: library.book },
        "/books/deprecated_url": { redirect: "/books/foo", permanent: true },
        "/books/delete": { action: library.delete_book, method: "POST", if: user.is_admin, else: forbidden }
    }

Keywords:

`static`
: files matching the route will be served statically, and no further processing will be done.

`action`
: a function, or an object with a `dispatch` method, which will be called if the route matches the URL

`method`
: list of HTTP request methods that the route matches

`redirect`
: redirects the request to the specified URL (default 302 Temporary redirect)

`permanent`
: causes the redirection to use a 301 Permanent redirect

`if`
: a function that returns a true or false. `action` will only be called if the function returns true

`else`
: a function, or object with `dispatch` method. if the `if` function returns false, call the function

`forbidden`
: a function which returns a 403 Forbidden response


## Templates ##

* Namespaced class attributes
* URL encoded parameters

Example:

    <h1 class="nodef:hello?name=Andy">This text will be replaced by the output of hello()</h1>

Templates are parsed recursively until all namespaced classes are removed.

## Snippets ##

* Function that accepts a DOM entity and returns a DOM entity
* Nestable

Example:

    function hello(in, args) {
        $(in).text("Hello " + args.name);
        return in;
    }

When used with the template in the template example, the output will look like this:

    <h1>Hello Andy</h1>

Predefined snippets:

`include`
: Requires a `template` parameter. The named template will be parsed and the result will be used to replace the tag.

`wrap`
: 
