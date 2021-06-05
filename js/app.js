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

// const apiKey = "49f60504b97b4536908bec624481a25a";
// const apiKey = "41c532f36a75476dade761a4ada57bfd";
// const apiKey = "09554bc11b0b4e4cb4d22c519e42604b";
const apiKey = "623686037cc046d9a78384bafee97a78";
// const apiKey = "612c24355bc24dbcbb4b13496d772971";
// const apiKey = "42d323055b9d49e6bab62f84d073699c";
// const apiKey = "8b869ec3eec745c99e0442c5abf60ccf";
// const apiKey = "e6ef2cde327f46e3820d0344025b79fc";

const api = "https://newsapi.org/v2/top-headlines";

const categories = ['business','entertainment','general','health','science','sports','technology'];
const countries = ['ae','ar','at','au','be','bg','br','ca','ch','cn','co','cu','cz','de','eg','fr','gb','gr','hk','hu','id','ie','il','in','it','jp','kr','lt','lv','ma','mx','my','ng','nl','no','nz','ph','pl','pt','ro','rs','ru','sa','se','sg','si','sk','th','tr','tw','ua','us','ve','za'];

let groups = [];

const url_string = window.location.href;
const url = new URL(url_string);
const country = url.searchParams.get("country") ?? "us";
const searchQuery = url.searchParams.get("searchQuery") ?? "";

for (let i = 0; i < categories.length; i++) {

    let posts = [];

    const response = fetch(api + "?q=" + searchQuery + "&country=" + country + "&category=" + categories[i] + "&apiKey=" + apiKey).then(response => {
        response.json().then(e => {
            if (typeof(e.articles) === "object") {
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

            }

            groups.push(new Group(categories[i], posts));

            if (i === categories.length - 1) {
                App.root.groups = groups;
            }
        });
    });
}


let App = new Easy({
    groups: null,
    countries: countries,
    textValue: "testText"
});

follow(() => {
    App.root.groups;
    App.root.countries;
    App.root.textValue;
    App.boot();
});


let input = document.getElementById('textValue');
console.log(input);

input.addEventListener('keyup', function () {

});