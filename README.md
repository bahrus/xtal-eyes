[![Published on webcomponents.org](https://img.shields.io/badge/webcomponents.org-published-blue.svg)](https://www.webcomponents.org/element/xtal-eyes)

<a href="https://nodei.co/npm/xtal-eyes/"><img src="https://nodei.co/npm/xtal-eyes.png"></a>

<img src="http://img.badgesize.io/https://unpkg.com/xtal-eyes@0.0.4/build/ES6/xtal-eyes.iife.js?compression=gzip">

# xtal-eyes

## Purpose

Sometimes we want an html document or dynamic HTML stream to wear two hats -- It can serve both as a standalone "page", but also serve as a web component embedded inside a larger "uber-app."  xtal-eyes provides a way of handling both scenarios.  In particular, it provides a conduit through which string properties can be passed.

xtal-eyes searches for a web component container first (based on Shadow DOM root or tag name with a dash).  If it finds such a container, it monitors for the specified attribute mutations on that element, and emits an event, "params-changed."  If it finds no such containing element, it monitors the location.search parameters for changes, and emits a similar event when they change.

## Syntax
```html
<xtal-eyes params='["param1", "param2"]'></xtal-eyes>
```