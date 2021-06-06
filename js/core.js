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

/**
 * This is reactive function variable
 * @param {*} data
 * @returns {*}
 */
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

        !this.root && log('#App is not found:\n (create div with id="app")', 'warn')

        // Init with data
        this.data = $(data);

        // Create virtual dom
        this.virtualDOM = demount(this.root);
        //
        // this.root.innerHTML = "";
        //
        // this.mount(this.virtualDOM, this.root);

        console.log(this.virtualDOM);

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
        let clone = Object.assign({}, this.virtualDOM);

        this.parser(clone)

        log('}\nEnd watching');
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

        for (let child in children) {
            let ch = children[child];
            if (!ch) continue;
            // Parse variables
            if (typeof ch === "string") {
                if (ch.indexOf('@->') === 0) {
                    const prop = ch.replace('@->', '');
                    if (this.data.hasOwnProperty(prop)) {
                        node.$ref.innerText = this.data[prop];
                    }
                }
                continue;
            }
            // Inputs
            if (ch.tagName === 'INPUT') {
                if (ch.props.hasOwnProperty('bind')) {
                    if (this.data.hasOwnProperty(ch.props.bind)) {
                        ch.$ref.value = this.data[ch.props.bind];
                    }
                }
            }
            // Cycles
            // if (ch.tagName === 'FOR') {
            //     if (ch.props.hasOwnProperty('in')) {
            //         if (this.data.hasOwnProperty(ch.props.in)) {
            //             let text = "";
            //             for (let obj of this.data[ch.props.in]) {
            //                 if (typeof obj === "object") {
            //                     let inner = ch.$ref.innerHTML;
            //                     for (let prop in obj) {
            //                         if (ch.$ref.innerText.includes(prop)) {
            //                             inner = inner.replace(`@-&gt;${prop}`, obj[prop]);
            //                         }
            //                     }
            //                     text += inner;
            //                 }
            //                 else
            //                 {
            //                     text += ch.$ref.innerHTML.replaceAll('@this', obj);
            //                 }
            //             }
            //             ch.$ref.outerHTML = text;
            //         }
            //     }
            // }

            // if(ch.tagName === 'FOR') {
            //     // For has attribute "in"
            //     if (ch.props.hasOwnProperty('in')) {
            //         // Data has filed form attribute "in"
            //         if (this.data.hasOwnProperty(ch.props.in)) {
            //             for(let c in ch.children) {
            //                 console.log(ch.children[c]);
            //             }
            //         }
            //     }
            // }

            // ch.tagName === 'FOR' && this.parseCycle(ch) || this.parser(ch);

            // if (ch.tagName === 'FOR') {
            //     // For has attribute "in"
            //     if (ch.props.hasOwnProperty('in')) {
            //         // Data has field form attribute "in"
            //         if (this.data.hasOwnProperty(ch.props.in)) {
            //             ch.$ref.innerHTML = "";
            //             for (let c of ch.children) {
            //                 ch.$ref.appendChild(
            //                     this.mountReturn(c)
            //                 );
            //             }
            //             let template = ch.$ref.innerHTML;
            //             let generatedContent = "";
            //             for (let prop in this.data[ch.props.in]) {
            //                 generatedContent += template;
            //             }
            //             ch.$ref.innerHTML = generatedContent;
            //
            //             this.parseCycle(ch.$ref, ch.props.in);
            //         }
            //     }
            // }
            // else {
            //     this.parser(ch);
            // }

            if (ch.tagName === 'FOR') {
                console.log('----------------------------------------------------');
                // console.log('Found tag for:')
                if (ch.props.hasOwnProperty('in')) {
                    // console.log(`has attribute in: ${ch.props.in}`);
                    if (this.data.hasOwnProperty(ch.props.in)) {
                        // console.group('Data has property:');
                        // console.log(this.data[ch.props.in]);
                        // console.groupEnd();
                        ch.$ref.innerHTML = "";
                        for (let c of ch.children) {
                            ch.$ref.appendChild(
                                this.mountReturn(c)
                            )
                        }
                        let template = ch.$ref.innerHTML;
                        let generatedContent = '';
                        for (let prop in this.data[ch.props.in]) {
                            generatedContent += template;
                        }
                        ch.$ref.innerHTML = generatedContent;

                        console.group('#FutureCyclesParser');

                        this.futureCyclesParser(ch.$ref, ch.props.in);

                        console.groupEnd();

                        // ch.$ref.outerHTML = ch.$ref = ch.$ref.innerHTML;
                    }
                }
                continue;
            }
            this.parser(ch);
        }
    }
    replace(element) {

    }
    futureCyclesParser(cycleElement, parameter) {
        for (let child of cycleElement.children) {
            if (child.tagName === 'FOR') {

                if (child.attributes.hasOwnProperty('in')) {
                    if (this.data.hasOwnProperty(parameter)) {
                        // console.log(this.data[parameter])
                        let template = child.innerHTML;
                        let generatedContent = '';
                        for (let object in this.data[parameter]) {
                            if (this.data[parameter][object].hasOwnProperty(child.getAttribute('in'))) {
                                // console.log(`Attribute ${child.getAttribute('in')}`)

                                let elementContent = template;

                                for (let prop in this.data[parameter][object][child.getAttribute('in')]) {
                                    console.log(prop)
                                    for (let pp in this.data[parameter][object][child.getAttribute('in')][prop]) {
                                        elementContent = elementContent.replaceAll(`@-&gt;${pp}`, this.data[parameter][object][child.getAttribute('in')][prop][pp]);
                                        elementContent = elementContent.replaceAll(`@->${pp}`, this.data[parameter][object][child.getAttribute('in')][prop][pp]);
                                    }
                                }

                                generatedContent += elementContent;
                            }
                        }
                        parameter = child.getAttribute('in');
                        child.outerHTML = generatedContent; // Need fix outerHtml: now nested cycles works only 2 iteration need make inner html then outerHtml
                    }
                }
            }
            this.futureCyclesParser(child, parameter);
        }
        // console.log(`Parameter: ${parameter}`);
    }
    parseCycle(cycle, parameter) {
        for (let child of cycle.children) {
            if (child.tagName === 'FOR') {
                if (child.attributes.hasOwnProperty('in')) {
                    if (this.data.hasOwnProperty(parameter)) {
                        if (this.data[parameter][0].hasOwnProperty(child.getAttribute('in'))) { /// Need fix this.data[parameter][0] - 0 change on iteration send in parameter
                            let template = child.innerHTML;
                            let generatedContent = "";
                            for (let obj in this.data[parameter][0]) {
                                generatedContent += template;
                            }
                            child.innerHTML = generatedContent;
                            console.log(child);
                        }
                    }
                }
            }
            this.parseCycle(child, parameter);
            if (child.tagName === 'FOR') {
                child.outerHTML = child.innerHTML;
            }
        }
    }


    cycles(cycleNode) {
        const { tagName, props, children } = cycleNode;
        // For has attribute "in"
        if (props.hasOwnProperty('in')) {
            // Data has field form attribute "in"
            if (this.data.hasOwnProperty(props.in)) {
                // Create template from "for" content
                let template = cycleNode.$ref.innerHTML;
                let generatedContent = '';
                for (let prop of this.data[props.in]) {
                    generatedContent += template;
                }
                cycleNode.$ref.outerHTML = generatedContent;
            }
        }


    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('keyup', function() {
        const e = event.target;
        if (e.attributes.hasOwnProperty('bind')) {
            App.data[e.attributes.bind.value] = e.value;
        }
    });
});