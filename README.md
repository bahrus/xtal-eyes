# \<xtal-eyes\>

Create a &#34;contract&#34; of required properties before publishing the object

\<xtal-eyes\> provides a general purpose mechanism for globally notifying when a sequence of asynchronous steps has completed.

It also provides some utilities where this concept is applied to web components (for example) that may depend on multiple other resources (JavaScript and CSS, for example) -- resources which we may want to "preload" using the \<link rel="preload"\> tag. 

## The JS Engineering Marvel

As we speak, modern browsers are starting to ship native support for:

1) ES6 modules.
2) Dynamic imports. 
3) Async/Await. 

This is likely to usher in an exciting new chapter of JavaScript development.  The ability to write simple, clean JavaScript with no build steps, without worrying about conflicting global variables, even conflicting versions of the same library; the ability to asynchronously load resources with simple statements -- these will be a real boon for development.

So now that we have no excuse for accidentally creating global variables, do global variables, or shared objects, still have a place?  The popularity of Redux, and the formal introduction of [a universal global object](https://github.com/tc39/proposal-global) strongly argues that the answer is yes.

\<xtal-eyes\> allows you to define a global constant mutable object, but to specify some empty field / property names during initialization that must be populated before the global mutable object constant is considered "complete" and ready for processing.


Why not use [Promise.all](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/all)?  If Promise.all suits your needs, by all means use it!  

But what if the code used to define the various properties of the contract needs to be separated -- first and foremost from the code that needs to be triggered when all the properties have been set? What if even setting the properties themselves might be convenient to do via a loosely coupled process?  That's the scenario \<xtal-eyes\> strives to help with. 

One might, perhaps, say that \<xtal-eyes\> provides a declarative way to define a promise.

These are the steps required to make use of \<xtal-eyes\>

## Step 1

To begin the process, we define a global constant string for the name of the some object we want to completely populate (with an extra underscore):

```html
<head>
    <script>
        const myContractName = '_myContractName';
    </script>
</head>
```

## Step 2

In the body of the web page, add the \<xtal-eyes\> element with some JavaScript inside that looks like:

```html
<xtal-eyes>
    <script>
        window[myContractName] = {
            prop1: null,
            prop2: null
        };
    </script>
</xtal-eyes>
```

Within the global object: myContractName, we can define as many properties as we want.  These null properties render the contract "incomplete," until none of the properties are null. 

When none of the properties are null, by default, \<xtal-eyes\> will set document.head.dataset.myContractName = myContractName;

Entities can use the mutation observer to be notified when this attribute has been set, and then query for the object via window[myContractName];

##  To do:  Loading utility

Suppose we have a web component called "my-chart" that relies on some third party resources.  And we want to preload those resources ahead of time, using the \<link rel="preload"\> tag.  So for example, we could add these tags:  The additional attributes class and data-name are optional (and we will see later how they are used.)

```html
<link rel="preload" as="script" href-"//somewhere/d3.js" class="myChartDependencies" data-name="d3">
<link rel="preload" as="script" href-"//over/chartLib.js" class="myChartDependencies" data-name="chart_lib">
<link rel="preload" as="style" href="//theRainbow/chartStyles.css" class="myChartDependencies" data-name="default_styles">
```

The use of class and data-name is not required, but we will see how it gets used now:

We can now add some code in the head.  Note the use of the "load" static utility function that comes with \<xtal-eyes\>:

```html
<head>
    <script>
        const myChartDependencies = '_myChartDependencies';
        customElements.whenDefined('XtalEyes').then(() =>{
            const xtalEyes = customElements.get('XtalEyes');
            xtalEyes.load(document.head.querySelectorAll('.myChartDependencies')).then(links =>{
                links.foreach(link =>{
                    window[myChartDependencies][link.dataset.name] = link;
                })
            })
            
        })
    </script>
</head>
<body>
<xtal-eyes>
    <script>
        window[myChartDependencies] = {
            d3: null,
            chart_lib: null,

        };
    </script>
</xtal-eyes>
...
</body>
```

\<xtal-eyes\> searches for such tags, and creates live import tags (import or script) so that the resources get loaded in memory. But it first checks if there is a data-test attribute, and if so, tests the expression to see if some other process may have already loaded the library.

In the case of classic script references (not ES6 Modules), there's no "output" of the script import.  Same with css file imports.  So in this case, \<xtal-eyes\> simply sets the property "loaded".  If an error is received, it is set to "failed."
 

##  To do:  Support ES6 Modules

Do we need [this?](https://www.chromestatus.com/features/5762805915451392)

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
