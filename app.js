// =========================
// LOAD DATA
// =========================

let tweets = JSON.parse(localStorage.getItem("tweets")) || [];

// =========================
// LOAD ON START
// =========================

window.onload = function () {
    tweets.forEach(renderTweet);
};

// =========================
// DARK MODE
// =========================

if (localStorage.getItem("dark") === "true") {
    document.body.classList.add("dark");
}

function toggleDark(){
    document.body.classList.toggle("dark");

    // smooth transition for ALL elements
    document.querySelectorAll("*").forEach(el => {
        el.style.transition = "0.3s ease";
    });

    localStorage.setItem(
        "dark",
        document.body.classList.contains("dark")
    );
}
// =========================
// ADD TWEET
// =========================

function addTweet() {
    let input = document.getElementById("tweetInput");
    let text = input.value.trim();

    if (text === "") return;

    let tweet = {
        id: Date.now(),
        text: text,
        likes: 0,
        retweets: 0
    };

    tweets.unshift(tweet);

    saveTweets();
    renderTweet(tweet);

    input.value = "";
}

// =========================
// RENDER TWEET
// =========================

div.innerHTML = `
    <i class="fa fa-user-circle fa-2x"></i>

    <div class="tweet-content">

        <div class="tweet-header">
            <b>${tweet.username || "User"}</b>
            <span class="handle">@user · now</span>
        </div>

        <p>${tweet.text}</p>

        <div class="actions">
            <i class="fa fa-comment"></i>
            <i class="fa fa-retweet"><span>${tweet.retweets}</span></i>
            <i class="fa fa-heart"><span>${tweet.likes}</span></i>
            <i class="fa fa-trash"></i>
        </div>

    </div>
`;
// =========================
// LIKE
// =========================

function like(id, el) {
    let tweet = tweets.find(t => t.id === id);

    if (!tweet) return;

    tweet.likes++;

    el.querySelector("span").innerText = tweet.likes;

    saveTweets();
}

// =========================
// RETWEET
// =========================

function retweet(id, el) {
    let tweet = tweets.find(t => t.id === id);

    if (!tweet) return;

    tweet.retweets++;

    el.querySelector("span").innerText = tweet.retweets;

    saveTweets();
}

// =========================
// DELETE
// =========================

function deleteTweet(id) {
    tweets = tweets.filter(t => t.id !== id);

    saveTweets();

    location.reload();
}

// =========================
// SAVE
// =========================

function saveTweets() {
    localStorage.setItem("tweets", JSON.stringify(tweets));
}