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
    boot() {
        let app = $("#app");

        if (!app) {
            return;
        }

        // find and replace cycles

        let allFor = app.querySelectorAll("for");

        if (!allFor) {
            return;
        }

        for (let oneFor of allFor) {
            let forIn = oneFor.getAttribute('in');
            let child = oneFor.innerHTML;
            let text = "";

            if (!this.root.hasOwnProperty(forIn))
                continue;

            if (!this.root[forIn])
                continue;

            if (typeof(this.root[forIn]) != "object")
                continue;

            this.root[forIn].forEach(e => {
                let el = child;
                if (typeof(e) === "object")
                {
                    el = el.replace("@this", e);
                    for(let p in e) {
                        el = el.replace("@:" + p, e[p] ?? '');
                    }
                }
                else
                {
                    el = el.replace("@this", e);
                }
                text += el;
            })

            oneFor.innerHTML = "";
            oneFor.outerHTML = text;
        }

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