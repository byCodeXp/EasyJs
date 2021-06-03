class Post {
    constructor(title, description, urlToImage, publishedAt, author, url, category) {
        this.title = title;
        this.description = description;
        this.urlToImage = urlToImage;
        this.publishedAt = publishedAt;
        this.author = author;
        this.url = url;
        this.category;
    }
}

const api = `https://newsapi.org/v2/top-headlines?country=us&apiKey=e6ef2cde327f46e3820d0344025b79fc&category=`;
// const api = `https://newsapi.org/v2/top-headlines?country=us&apiKey=8b869ec3eec745c99e0442c5abf60ccf&category=`;
let categories = ['business','entertainment','general','health','science','sports','technology'];
let posts = [];

categories.forEach(category => {
    fetch(api + category).then(response => {
        response.json().then(e => {
            let articles = e.articles;
            for (let item in articles) {
                posts.push(new Post(articles[item].title, articles[item].description, articles[item].urlToImage, articles[item].publishedAt, articles[item].author, articles[item].url, category));
            }
        });
    });
});

console.log(posts);

let app = new Easy({
    data: {
        data: "Hle",
        posts: null
    },
    methods: {

    }
});

setTimeout(() => {
    app.root.data.posts = posts;
    app.boot();
}, 500);
