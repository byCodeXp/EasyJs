const debug = true;

/**
 * @param query {string}
 * @return {NodeListOf<*>|null|*}
 */
function $$(query) {
    if (!query) return null;
    if (query.includes('#')) {
        return document.querySelector(query);
    }
    return document.querySelectorAll(query);
}

function log(message = {}, type = 'info') {
    if (!debug) return;
    type === 'info' && console.log(message);
    type === 'warn' && console.warn(message);
    type === 'error' && console.error(message);
    type === 'table' && console.table(message);
}

class eNode {
    constructor(tagName, props = {}, children = []) {
        this.tagName = tagName;
        this.props = props;
        this.children = children;
    }
}

/**
 * ### This function make nodes tree from html
 * ### Need fix: if html element has, child node and text - text will be lost
 * @param domElement {HTMLElement}
 * @returns eNode
 */
function demount(domElement) {
    const newNode = new eNode(domElement.tagName);
    for (const attribute of domElement.attributes) {
        newNode.props[attribute.name] = attribute.value;
    }
    for (const child of domElement.children) {
        newNode.children.push(demount(child));
    }
    if (!newNode.children.length > 0) {
        newNode.children.push(domElement.innerText);
    }

    newNode.$ref = domElement;

    return newNode;
}

class Dep {
    constructor() {
        this.subscribers = new Set();
    }

    depend() {
        if (action) this.subscribers.add(action);
    }

    notify() {
        this.subscribers.forEach((subscriber) => subscriber());
    }
}

/**
 * This is reactive function variable
 * @param {*} data
 * @returns {*}
 */
function $ (data) {
    Object.keys(data).forEach((key) => {
        const dep = new Dep();
        let value = data[key];
        Object.defineProperty(data, key, {
            get() {
                dep.depend();
                return value;
            },
            set(newValue) {
                value = newValue;
                dep.notify();
            }
        });
    });
    return data;
}

let action = null;

function follow(delegate) {
    action = delegate;
    delegate();
    action = null;
}

class Easy {
    constructor(data= {}) {

        // Get root dom element
        this.root = $$('#app');

        !this.root && log('#App is not found:\n (create div with id="app")', 'warn')

        // Init with data
        this.data = $(data);

        // Create virtual dom
        this.virtualDOM = demount(this.root);

        // this.root.innerHTML = "";

        // this.mount(this.virtualDOM, this.root);

        console.log(this.virtualDOM);

        log('Created instance app with data:');
        log(this.data, 'table');

        this.it = 0; ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

        this.watch();

        follow(() => {
            this.data;
            this.watch();
        });
    }
    watch() {
        console.groupCollapsed('Watching');

        let clone = Object.assign({}, this.virtualDOM);
        this.parser(clone);

        console.groupEnd();
    }
    unmount(node) {
        this.virtualDOM.$ref.parentNode.removeChild(node.$ref);
    }
    mountReturn(node) {
        const { tagName, props, children } = node;

        const newElement = document.createElement(tagName);

        for (const att in props) {
            newElement.setAttribute(att, props[att]);
        }

        for (const child of children) {
            if (!child) {
                continue;
            }
            if (typeof child === "string") {
                // if (child.indexOf('@->') === 0) {
                //     const prop = child.replace('@->', '');
                //     if (this.data.hasOwnProperty(prop)) {
                //         newElement.innerText = this.data[prop];
                //     }
                // }
                // else {
                //     newElement.innerText = child;
                // }
                newElement.innerText = child;
                continue;
            }
            newElement.appendChild( this.mountReturn(child) );
        }

        node.$ref = newElement;

        return newElement;
    }
    mount(node, container) {
        const { tagName, props, children } = node;

        const newElement = document.createElement(tagName);

        for (const att in props) {
            newElement.setAttribute(att, props[att]);
        }

        if (children) {
            for (const child of children) {
                if (typeof child === "string") {
                    newElement.innerText = child;
                }
                else {
                    this.mount(child, newElement);
                }
            }
        }

        container.appendChild(newElement);

        node.$ref = newElement;
    }
    parser(node) {
        let { tagName, props, children } = node;

        children.forEach(child => {
            if (typeof child === "string") {
                if (child.indexOf('@->') === 0) {
                    const prop = child.replace('@->', '');
                    if (prop in this.data) {
                        if (typeof this.data[prop] === 'function') {
                            node.$ref.innerText = this.data[prop]();
                        }
                        else {
                            node.$ref.innerText = this.data[prop];
                        }
                    }
                }
                return;
            }
            if (child.tagName === 'INPUT')
                if ('bind' in child.props)
                    if (child.props.bind in this.data)
                        child.$ref.value = this.data[child.props.bind];

            if (child.tagName === 'FOR') {
                if ('in' in child.props) {
                    const pointer = child.props.in;

                    if (pointer in this.data) {
                        child.$ref.innerHTML = '';

                        child.children.forEach(c => {
                            child.$ref.appendChild(this.mountReturn(c));
                        });

                        let template = child.$ref.innerHTML;
                        let generatedContent = '';

                        if (typeof this.data[pointer] === 'function') {
                            this.data[pointer]().forEach(obj => {
                                generatedContent += template;
                            })
                        }
                        else
                        {
                            this.data[pointer].forEach(obj => {
                                generatedContent += template;
                            })
                        }

                        child.$ref.innerHTML = generatedContent;

                        this.it = 0;
                        this.cycleParse(child.$ref, pointer);
                    }

                }
            }
            this.parser(child)
        });
    }

    cycleParse(cycleElement, parameter) {
        let data;

        if (typeof this.data[parameter] === 'function') {
            data = this.data[parameter]();
        }
        else {
            data = this.data[parameter];
        }

        for (let child of cycleElement.children) {
            if (child.tagName !== 'FOR') {
                if (child.innerText.indexOf('@->') === 0) {
                    const prop = child.innerText.replace('@->', '');

                    if (prop in data[this.it]) {
                        child.innerText = data[this.it][prop];
                    }
                }

                this.cycleParse(child, parameter);
                continue;
            }

            if (!'in' in child.attributes) continue;

            const pointer = child.getAttribute('in');

            if (!parameter in this.data) continue;

            data.forEach(obj => {

                let template = child.innerHTML;
                let generatedContent = '';

                // one category

                if (!pointer in obj) return;

                for (let element in data[this.it][pointer]) {
                    let text = template;
                    for (let field in data[this.it][pointer][element]) {
                        text = text.replaceAll(`@-&gt;${field}`, data[this.it][pointer][element][field]);
                    }
                    generatedContent += text;
                }
                child.outerHTML = generatedContent;
            });
            this.it++;
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keyup', function() {
        const e = event.target;
        if ('bind' in e.attributes) {
            App.data[e.attributes.bind.value] = e.value;
        }
    });
});