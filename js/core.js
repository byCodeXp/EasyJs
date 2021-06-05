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
    switch (type) {
        case 'info':
            console.log(message);
            break;
        case 'warn':
            console.warn(message);
            break;
        case 'error':
            console.error(message);
            break;
        case 'table':
            console.table(message);
            break;
    }
}

// Virtual dom

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
    return newNode;
}

/**
 * ### This function make dom from nodes tree
 * @param node
 * @returns {HTMLElement}
 */
// function mount(node) {
//     const { tagName, props, children } = node;
//
//     const newElement = document.createElement(tagName);
//
//     for (const att in props) {
//         newElement.setAttribute(att, props[att]);
//     }
//
//     for (const child of children) {
//         if (!child) {
//             continue;
//         }
//         if (typeof child === "string") {
//             newElement.innerText = child;
//             continue;
//         }
//         newElement.appendChild( mount(child) );
//     }
//
//     return newElement;
// }

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

function $(data) {
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
        if (!this.root) {
            log('#App is not found:\n (create div with id="app")', 'warn')
        }

        // Init with data
        this.data = $(data);

        // Create virtual dom
        this.virtualDOM = demount(this.root);

        log('Created instance app with data:');
        log(this.data, 'table');

        this.watch();

        follow(() => {
            this.data;
            this.watch();
        });

    }
    watch() {
        log('Star watching dom\n{');

        this.root.innerHTML = this.mount(this.virtualDOM).innerHTML;

        log('}\nEnd watching');
    }
    compare() {

    }
    mount(node) {
        const { tagName, props, children } = node;

        const newElement = document.createElement(tagName);

        if (tagName === 'INPUT') {
            if (props.hasOwnProperty('bind')) {
                if (this.data.hasOwnProperty(props.bind))
                newElement.setAttribute('value', this.data[props.bind]);
            }
        }

        for (const att in props) {
            newElement.setAttribute(att, props[att]);
        }

        for (const child of children) {
            if (!child) {
                continue;
            }
            if (typeof child === "string") {
                // Parse reactive fields
                if (child.indexOf('@->') === 0) {
                    const prop = child.replace('@->', '');
                    if (this.data.hasOwnProperty(prop)) {
                        newElement.innerText = this.data[prop];
                    }
                }
                else {
                    newElement.innerText = child;
                }
                continue;
            }
            newElement.appendChild( this.mount(child) );
        }

        return newElement;
    }
}

document.addEventListener('keyup', function() {
    const e = event.target;
    if (e.attributes.hasOwnProperty('bind')) {
        App.data[e.attributes.bind.value] = e.value;
    }
});