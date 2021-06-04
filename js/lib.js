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
    cycles(elementDOM) {
        // find all cycles
        let allCycles = elementDOM.querySelectorAll("for");
        if (!allCycles) return;

        // iteration cycles
        for(let cycle of allCycles) {
            // value in attribute of cycle <for in="value">

            let attribute = cycle.getAttribute('in');
            let newDOM = cycle.innerHTML;
            let generatedContent = "";

            // check if data has current filed
            if (!this.root.hasOwnProperty(attribute)) continue;
            let data = this.root[attribute];

            // check if not null
            if (!data) continue;
            // check if iterable
            if (typeof (data) != "object") continue;

            // iteration by items of data
            for (let obj in data) {
                // make new instance of content

                // check object, maybe array, or value
                if (typeof(data[obj]) === "object") {
                    // iteration by properties of object
                    for (let prop in data[obj]) {
                        newDOM = newDOM.replaceAll(`@:${prop}`, data[obj][prop]);
                    }
                }

                // find @this in html: can be used in simple array

                newDOM = newDOM.replaceAll("@this", data[obj]);

                // add item to other elements

                generatedContent += newDOM;
            }

            // change for tags on generated content
            cycle.innerHTML = "";
            cycle.outerHTML = generatedContent;
        }
    }
    cyclesVirtual(virtualDOM) {
        return virtualDOM;
    }
    boot() {
        let app = $("#app");
        
        if (!app)  {
            console.warn("#app not found");
            return;
        }

        console.log(
            this.cyclesVirtual(demount(app))
        )

        // this.cycles(app);

        // find and replace variables

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