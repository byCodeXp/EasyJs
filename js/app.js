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
// const api = `https://newsapi.org/v2/top-headlines?country=us&apiKey=8b869ec3eec745c99e0442c5abf60ccf&category=`;
let categories = ['business','entertainment','general','health','science','sports','technology'];

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


for (let i = 0; i < categories.length; i++) {

    let posts = [];

    fetch(api + categories[i]).then(response => {
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
    groups: null
});

follow(() => {
    App.root.groups;
    App.boot();
});