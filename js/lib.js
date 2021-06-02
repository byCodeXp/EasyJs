$ = (query) => {
    return document.querySelector(query);
}

class Easy {
    constructor(data = null) {
        this.root = data;
        this.boot = function () {

            const app = $("#app");

            let dom = app.innerHTML;

            // find and replace variables

            for(let data in this.root.data) {
                dom = dom.replace('@:' + data, this.root.data[data]);
            }

            app.innerHTML = dom;
        }
        document.addEventListener('DOMContentLoaded', () => {
            this.boot();
        });
    }
}