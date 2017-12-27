# \<xtal-eyes\>

Create a &#34;contract&#34; of required properties before publishing the object

As we speak, modern browsers are shipping native support for:

1) ES6 modules.
2) Dynamic imports. 
3) Async/Await. 

This is likely to uhser in an exciting new chapter of JavaScript development.  The ability to write simple, clean JavaScript with no build steps, without worrying about conflicting global variables, even conflicting versions of the same library; the ability to asynchronously load resources with simple statements -- these will be a real boon for development.

So now that we have no excuse for accidentally creating global variables, do global variables still have a place?  The popularity of Redux, and the formal introduction of [a universal global object](https://github.com/tc39/proposal-global) strongly argues that the answer is yes.

\<xtal-eyes\> allows you to define a global constant mutable object, but to specify some empty field / property names during initialization that must be populated before the constant is considered "complete" and ready for processing.

This seemingly strange requirement came out of a desire to provide a way of defining loosely coupled mixin's for a web component.  The examples in this document will focus on that problem, but I suspect a smattering of other scenarios may also arise where this compoenent could be useful.

Why not use [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)?  If Promise.all suits your needs, by all means use it!  

But what if the code used to define the various properties of the contract needs to be separated -- first and foremost from the code that needs to be triggered when all the properties have been set? What if even setting the properties themselves might be convenient to do via a loosely coupled process?  That's the scenario \<xtal-eyes\> strives to help with.

## Step 1

To begin the process, we define a global constant string for the name of the property:

```html
<head>
    <script>
        const myContractName = 'myContractName';
    </script>
</head>
```

## Step 2

In the body of the web page, add the \<xtal-eyes\> element with some JavaScript inside:

```html
    <xtal-eyes>
    <script>
        window['_' + myContractName] = {
            prop1: null,
            prop2: null
        }
    </script>
```

Within the global object '_' + myContractName, we can define as many properties as we want.  The contract will not be "complete" until none of the properties are null. 

When none of the properties are null, by default, \<xtal-eyes\> will set document.head.dataset.myContractName = '_' + myContractName;

Entities can use the mutation observer to be notified when this attribute has been set, and then query for the object via window['_' + myContractName];

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) installed. Then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
