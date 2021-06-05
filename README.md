# EasyJs - it's lightweight javascript library.
>>>>>this is draft version
## Structure

For begin you need create main app class Easy.

Example:
```html
<html>
    <head>
    </head>
    <body>
        <div id="app">
            <h1>@->someField</h1>
            <div>
                <h2>Array</h2>
                <for in="array">
                    <span>@this</span>
                </for>
            </div>
            <div>
                <h2>Frameworks</h2>
                <for in="frameworks">
                    <div>
                        <span>@->title</span>
                        <span>@->release</span>
                    </div>
                </for>
            </div>
        </div>
        <script src="js/easy.js"></script>
        <script>
            const App = new Easy({
                someField: "hello world",
                array: ['🍉', '🍋' , '🍎'],
                frameworks: [
                    {
                        title: 'Angualar',
                        release: '2010-10-20'
                    },
                    {
                        title: 'Vue',
                        release: '2014-02-01'
                    },
                    {
                        title: 'React',
                        release: '2013-05-29'
                    },
                ]
            });
        </script>
    </body>
</html>
```

## Reactivity

### bind

Use attribute `bind` in yours `input`. Inside attribute, - pass the name to the variable.

Attribute `bind` - works in two ways.

```html
<html>
<head>
</head>
<body>
<div id="app">
    <input bind="searchQuery" type="text">
    <span>@searchQuery</span>
</div>
<script src="js/easy.js"></script>
<script>
    const App = new Easy({
        searchQuery: ""
    });
</script>
</body>
</html>
```