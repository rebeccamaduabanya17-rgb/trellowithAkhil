// =========================
// LOAD DATA FROM LOCALSTORAGE
// =========================
let tweets = JSON.parse(localStorage.getItem("tweets")) || [];

// =========================
// LOAD ON START
// =========================
window.addEventListener("DOMContentLoaded", function () {
    loadTweets();
    checkDarkMode();
});

// =========================
// DARK MODE TOGGLE
// =========================
function toggleDark() {
    document.body.classList.toggle("dark");
    
    // Save preference to localStorage
    const isDark = document.body.classList.contains("dark");
    localStorage.setItem("darkMode", isDark);
    
    // Add smooth transition
    document.querySelectorAll("*").forEach(el => {
        el.style.transition = "background-color 0.3s ease, color 0.3s ease";
    });
}

// Load dark mode preference on page load
function checkDarkMode() {
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
        document.body.classList.add("dark");
    }
}

// =========================
// ADD NEW TWEET
// =========================
function addTweet() {
    const input = document.getElementById("tweetInput");
    const text = input.value.trim();

    if (text === "") {
        alert("Tweet cannot be empty!");
        return;
    }

    const tweet = {
        id: Date.now(),
        text: text,
        username: "You",
        handle: "@RebeccaMadubanya",
        likes: 0,
        retweets: 0,
        comments: 0,
        shares: 0,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    tweets.unshift(tweet);
    saveTweets();
    renderNewTweet(tweet);
    input.value = "";
    input.focus();
}

// =========================
// RENDER TWEET
// =========================
function renderNewTweet(tweet) {
    const container = document.getElementById("tweets-container");
    const tweetEl = createTweetElement(tweet);
    
    // Insert after the tweet box
    const tweetBox = document.querySelector(".tweet-box");
    if (tweetBox.nextSibling) {
        container.insertBefore(tweetEl, tweetBox.nextSibling);
    } else {
        container.appendChild(tweetEl);
    }
}

function createTweetElement(tweet) {
    const div = document.createElement("div");
    div.className = "tweet";
    div.dataset.tweetId = tweet.id;

    div.innerHTML = `
        <i class="fa fa-user-circle fa-2x"></i>
        <div class="tweet-content">
            <div class="tweet-header">
                <b>${tweet.username}</b>
                <span class="tweet-handle">${tweet.handle} · ${tweet.timestamp}</span>
            </div>
            <p class="tweet-text">${escapeHtml(tweet.text)}</p>
            <div class="tweet-actions">
                <div class="action-item" onclick="toggleComment(event)">
                    <i class="fa fa-comment"></i>
                    <span>${tweet.comments || 0}</span>
                </div>
                <div class="action-item" onclick="toggleRetweet(event)">
                    <i class="fa fa-retweet"></i>
                    <span>${tweet.retweets || 0}</span>
                </div>
                <div class="action-item" onclick="toggleLike(event)">
                    <i class="fa fa-heart"></i>
                    <span>${tweet.likes || 0}</span>
                </div>
                <div class="action-item" onclick="toggleShare(event)">
                    <i class="fa fa-share"></i>
                    <span>${tweet.shares || 0}</span>
                </div>
            </div>
        </div>
    `;

    return div;
}

// =========================
// LOAD ALL TWEETS
// =========================
function loadTweets() {
    const container = document.getElementById("tweets-container");
    
    // Keep the tweet box and welcome tweets
    const welcomeTweets = container.querySelectorAll(".tweet");
    
    // Add loaded tweets
    tweets.forEach(tweet => {
        const tweetEl = createTweetElement(tweet);
        container.appendChild(tweetEl);
    });
}

// =========================
// LIKE FUNCTIONALITY
// =========================
function toggleLike(event) {
    event.stopPropagation();
    
    const actionItem = event.currentTarget;
    const tweet = actionItem.closest(".tweet");
    const tweetId = parseInt(tweet.dataset.tweetId);
    const span = actionItem.querySelector("span");

    // Find tweet in array
    const tweetObj = tweets.find(t => t.id === tweetId);
    
    if (actionItem.classList.contains("liked")) {
        actionItem.classList.remove("liked");
        if (tweetObj) tweetObj.likes--;
    } else {
        actionItem.classList.add("liked");
        if (tweetObj) tweetObj.likes++;
    }

    if (tweetObj) {
        span.textContent = tweetObj.likes;
        saveTweets();
    }
}

// =========================
// RETWEET FUNCTIONALITY
// =========================
function toggleRetweet(event) {
    event.stopPropagation();
    
    const actionItem = event.currentTarget;
    const tweet = actionItem.closest(".tweet");
    const tweetId = parseInt(tweet.dataset.tweetId);
    const span = actionItem.querySelector("span");

    const tweetObj = tweets.find(t => t.id === tweetId);
    
    if (tweetObj) {
        tweetObj.retweets++;
        span.textContent = tweetObj.retweets;
        saveTweets();
    }

    // Visual feedback
    actionItem.style.color = "#17bf63";
    setTimeout(() => {
        actionItem.style.color = "";
    }, 200);
}

// =========================
// COMMENT FUNCTIONALITY
// =========================
function toggleComment(event) {
    event.stopPropagation();
    
    const actionItem = event.currentTarget;
    const tweet = actionItem.closest(".tweet");
    const tweetId = parseInt(tweet.dataset.tweetId);
    const span = actionItem.querySelector("span");

    const tweetObj = tweets.find(t => t.id === tweetId);
    
    if (tweetObj) {
        tweetObj.comments++;
        span.textContent = tweetObj.comments;
        saveTweets();
    }

    // Visual feedback
    actionItem.style.color = "#1d9bf0";
    setTimeout(() => {
        actionItem.style.color = "";
    }, 200);
}

// =========================
// SHARE FUNCTIONALITY
// =========================
function toggleShare(event) {
    event.stopPropagation();
    
    const actionItem = event.currentTarget;
    const tweet = actionItem.closest(".tweet");
    const tweetId = parseInt(tweet.dataset.tweetId);
    const span = actionItem.querySelector("span");

    const tweetObj = tweets.find(t => t.id === tweetId);
    
    if (tweetObj) {
        tweetObj.shares++;
        span.textContent = tweetObj.shares;
        saveTweets();
    }

    // Visual feedback
    actionItem.style.color = "#1d9bf0";
    setTimeout(() => {
        actionItem.style.color = "";
    }, 200);
}

// =========================
// DELETE TWEET
// =========================
function deleteTweet(tweetId) {
    tweets = tweets.filter(t => t.id !== tweetId);
    saveTweets();
    
    const tweetEl = document.querySelector(`[data-tweet-id="${tweetId}"]`);
    if (tweetEl) {
        tweetEl.style.opacity = "0";
        tweetEl.style.transition = "opacity 0.3s ease";
        setTimeout(() => tweetEl.remove(), 300);
    }
}

// =========================
// SAVE TWEETS
// =========================
function saveTweets() {
    localStorage.setItem("tweets", JSON.stringify(tweets));
}

// =========================
// UTILITY FUNCTIONS
// =========================

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// Keyboard shortcuts
document.addEventListener("keydown", function(event) {
    // Alt + T to focus on tweet input
    if (event.altKey && event.key === "t") {
        event.preventDefault();
        document.getElementById("tweetInput").focus();
    }
    
    // Enter to tweet (Ctrl/Cmd + Enter)
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
        const textarea = document.getElementById("tweetInput");
        if (document.activeElement === textarea) {
            event.preventDefault();
            addTweet();
        }
    }
});

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
            target.scrollIntoView({ behavior: "smooth" });
        }
    });
});
