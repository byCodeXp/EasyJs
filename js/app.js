class Post {
    constructor(title, description, urlToImage, publishedAt, author, url, category) {
        this.title = title;
        this.description = description;
        this.urlToImage = urlToImage;
        this.publishedAt = publishedAt;
        this.author = author;
        this.url = url;
        this.category = category;
    }
}

class Group {
    constructor(title, posts) {
        this.title = title;
        this.posts = posts;
    }
}

// const api = `https://newsapi.org/v2/top-headlines?country=us&apiKey=e6ef2cde327f46e3820d0344025b79fc&category=`;
const api = "https://newsapi.org/v2/top-headlines";
const apiKey = "8b869ec3eec745c99e0442c5abf60ccf";
// const api = `https://newsapi.org/v2/top-headlines?country=us&apiKey=8b869ec3eec745c99e0442c5abf60ccf&category=`;
const categories = ['business','entertainment','general','health','science','sports','technology'];
const countries = ['ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz','de','eg','fr','gb','gr','hk','hu','id','ie','il','in','it','jp','kr','lt','lv','ma','mx','my','ng','nl','no','nz','ph','pl','pt','ro','rs','ru','sa','se','sg','si','sk','th','tr','tw','ua','us','ve','za'];

let groups = [];
//
// let posts = [];
//
// posts.push(new Post('Heleo'))
// posts.push(new Post('Unique'))
// posts.push(new Post('test'))
//
// groups.push(new Group('Group B', posts));
// groups.push(new Group('321', posts));

//

const url_string = window.location.href;
const url = new URL(url_string);
const country = url.searchParams.get("country") ?? "us";

for (let i = 0; i < categories.length; i++) {

    let posts = [];

    fetch(api + "?country=" + country + "&category=" + categories[i] + "&apiKey=" + apiKey).then(response => {
        response.json().then(e => {
            for (let a of e.articles) {
                posts.push(new Post(
                    a.title,
                    a.description,
                    a.urlToImage ?? 'https://i.stack.imgur.com/y9DpT.jpg',
                    a.publishedAt,
                    a.author,
                    a.url,
                    categories[i]
                ));
            }

            groups.push(new Group(categories[i], posts));

            if (i === categories.length - 1) {
                App.root.groups = groups;
            }
        });
    });
}

console.log(groups);

let App = new Easy({
    dropDown: false,
    groups: null,
    countries: countries,
    toggleMenu: () => {
        let element = document.getElementById("dropdown02");
        element.classList.toggle("show");
    }
});

follow(() => {
    App.root.groups;
    App.root.countries;
    App.boot();
});