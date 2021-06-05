$ = (query) => {
    return document.querySelector(query);
}

// Reactive

let action;

function follow(func) {
    action = func;
    func();
    action = null;
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

function reactive(obj) {
    Object.keys(obj).forEach((key) => {
        const dep = new Dep();
        let value = obj[key];

        Object.defineProperty(obj, key, {
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
    return obj;
}

class Easy {
    cycles(elementDOM, parameter = null) {
        // find all cycles
        let allCycles = elementDOM.querySelectorAll("for");
        if (!allCycles) {
            console.warn("allCycles is null");
            return;
        }

        let it = 0;

        // iteration cycles
        for(let cycle of allCycles) {
            // value in attribute of cycle <for in="value">

            let attribute = cycle.getAttribute('in');
            let generatedContent = "";

            let data;

            // check if data has current filed
            if (parameter) {
                if (!this.root[parameter][it].hasOwnProperty(attribute)) {
                    console.warn("this.root[data] not found");
                    continue;
                }
                data = this.root[parameter][it][attribute];
            }
            else
            {
                if (!this.root.hasOwnProperty(attribute)) {
                    console.warn("this.root[data] not found");
                    continue;
                }
                data = this.root[attribute];
            }

            it++;

            // check if not null
            if (!data) {
                console.warn("data is null");
                continue;
            }
            // check if iterable
            if (typeof (data) != "object") {
                console.warn("data is not type object")
                continue;
            }

            // iteration by items of data
            for (let obj in data) {
                // make new instance of content

                let newDOM = cycle.innerHTML;

                // check object, maybe array, or value
                if (typeof(data[obj]) === "object") {
                    // iteration by properties of object
                    for (let prop in data[obj]) {
                        let text = newDOM.match(/<for[^`]*for>/gm);
                        newDOM = newDOM.replace(/<for[^`]*for>/gm, '@for');
                        newDOM = newDOM.replaceAll(`@:${prop}`, data[obj][prop]);
                        newDOM = newDOM.replace('@for', text);
                    }
                }
                else
                {
                    let text = newDOM.match(/<for[^`]*for>/gm);
                    newDOM = newDOM.replace(/<for[^`]*for>/gm, '@for');
                    newDOM = newDOM.replaceAll("@this", data[obj]);
                    newDOM = newDOM.replace('@for', text);
                }

                // find @this in html: can be used in simple array

                // add item to other elements
                generatedContent += newDOM;
            }

            // change for tags on generated content
            cycle.innerHTML = "";
            cycle.innerHTML = generatedContent;

            this.cycles(cycle, attribute);

            cycle.outerHTML = cycle.innerHTML;
        }
    }
    replace(node, find, change) {
        console.log(node)
        if (typeof (node.children) === "string") {
            let text = node.children;
            text = text.replace(find, change)
            node.children = text;
            return node;
        }
        // else
        // {
        //     for (let child of node.children) {
        //         this.replace(child);
        //     }
        // }
    }
    cyclesVirtual(virtualDOM) {
        for (let child of virtualDOM.children) {
            if (child.tagName === "FOR") {
                let attribute = child.props['in'];
                if (!attribute) continue;

                if (!this.root.hasOwnProperty(attribute)) continue;
                let data = this.root[attribute];

                // check if not null
                if (!data) continue;
                // check if iterable
                if (typeof (data) != "object") continue;
                // iteration by items of data

                for (let obj in data) {
                    // check object, maybe array, or value
                    if (typeof(data[obj]) === "object") {

                        // iteration by properties of object
                        for (let prop in data[obj]) {
                            // child = this.replace(child, `@:${prop}`, data[obj][prop]);
                        }
                    }
                }
            }
        }

        return virtualDOM;
    }
    boot() {
        let app = $("#app");

        if (!app)  {
            console.warn("#app not found");
            return;
        }

        this.cycles(app);

        // binding
        //
        // let inputs = app.querySelectorAll('input');
        //
        // for(let input of inputs) {
        //     if (input.hasAttribute('bind')) {
        //         let bind = input.getAttribute('bind');
        //         console.log(bind);
        //         if (this.root.hasOwnProperty(bind)) {
        //             console.warn(this.root[bind]);
        //
        //         }
        //         input.addEventListener('keyup', function() {
        //             this.root
        //         });
        //     }
        // }

        //

        let dom = app.innerHTML;

        for(let data in this.root.data) {
            dom = dom.replace('@:' + data, this.root.data[data]);
        }

        app.innerHTML = dom;
    }

    constructor(data = null) {
        this.root = new reactive(data);

        document.addEventListener('DOMContentLoaded', () => {
            this.boot();
        });
    }
}