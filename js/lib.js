$ = (query) => {
    return document.querySelector(query);
}

class Easy {
    boot() {
        let app = $("#app");

        // find and replace cycles

        let allFor = app.querySelectorAll('for');
        allFor.forEach(oneFor => {
            let forIn = oneFor.getAttribute('in');
            let child = oneFor.innerHTML;
            let text = "";

            if (this.root.data.hasOwnProperty(forIn)) {
                this.root.data[forIn].forEach(e => {
                    let el = child;
                    if (typeof(e) === "object")
                    {
                        el = el.replace("@this", e);
                        for(let p in e) {
                            el = el.replace("@:" + p, e[p]);
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
        });

        // find and replace variables

        let dom = app.innerHTML;

        for(let data in this.root.data) {
            dom = dom.replace('@:' + data, this.root.data[data]);
        }

        app.innerHTML = dom;
    }

    constructor(data = null) {
        this.root = data;
        document.addEventListener('DOMContentLoaded', () => {
            this.boot();
        });
    }
}