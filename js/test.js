let app = document.querySelector('for');

console.log(app)
console.log(app.children)

let html = app.innerHTML;

for (let child of app.children) {
    html = html.replace(child.outerHTML, "");
}

console.log(html)

