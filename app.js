// =========================
// LOAD DATA (with seeds)
// =========================

let tweets = JSON.parse(localStorage.getItem("tweets")) || [];

// If no tweets saved, seed some example tweets so feed isn't empty
if (!tweets || tweets.length === 0) {
  tweets = [
    {
      id: Date.now() + 2,
      username: "Twitter Clone",
      handle: "@clone",
      text: "Welcome to your timeline 🚀",
      likes: 0,
      retweets: 0,
      createdAt: new Date().toISOString()
    },
    {
      id: Date.now() + 1,
      username: "Developer",
      handle: "@dev",
      text: "This is your Twitter clone project 💻",
      likes: 0,
      retweets: 0,
      createdAt: new Date().toISOString()
    }
  ];
  localStorage.setItem("tweets", JSON.stringify(tweets));
}

// =========================
// ON START: render existing tweets
// =========================

window.addEventListener('DOMContentLoaded', () => {
  // render tweets in stored order (oldest-first -> append)
  const stored = tweets || [];
  stored.forEach(t => renderTweet(t, false));

  // wire up character count behavior
  const input = document.getElementById('tweetInput');
  const charCount = document.getElementById('charCount');
  const max = 280;
  if (input && charCount) {
    charCount.innerText = max;
    input.addEventListener('input', () => {
      const remaining = Math.max(0, max - input.value.length);
      charCount.innerText = remaining;
    });
  }

  // set aria-pressed on the toggle to reflect current state
  const isDark = localStorage.getItem('dark') === "true";
  const btn = document.getElementById('darkToggle');
  if (btn) btn.setAttribute('aria-pressed', isDark ? 'true' : 'false');

  // setup search input + trending filter
  setupSearch();
});

// =========================
// DARK MODE
// =========================

// toggle class on <html> (documentElement) so our inline script and CSS match
function toggleDark(){
    const root = document.documentElement;
    root.classList.toggle("dark");

    // smooth transition for ALL elements (optional)
    document.querySelectorAll("*").forEach(el => {
        el.style.transition = "0.25s ease";
    });

    const isNow = root.classList.contains("dark");
    localStorage.setItem("dark", isNow ? "true" : "false");

    // update aria state
    const btn = document.getElementById('darkToggle');
    if (btn) btn.setAttribute('aria-pressed', isNow ? 'true' : 'false');
}

// If user had dark saved but inline script failed, ensure class added on load
if (localStorage.getItem("dark") === "true") {
    document.documentElement.classList.add("dark");
}

// =========================
// ADD TWEET
// =========================

function addTweet() {
    const input = document.getElementById("tweetInput");
    if (!input) return;
    const text = input.value.trim();

    if (text === "") return;

    const tweet = {
        id: Date.now(),
        username: "You",
        handle: "@you",
        text: text,
        likes: 0,
        retweets: 0,
        createdAt: new Date().toISOString()
    };

    // keep newest at top
    tweets.unshift(tweet);
    saveTweets();

    // render at top
    renderTweet(tweet, true);

    // reset
    input.value = "";
    const charCount = document.getElementById('charCount');
    if (charCount) charCount.innerText = 280;
}

// =========================
// RENDER TWEET
// =========================

function renderTweet(tweet, prepend = false) {
    const container = document.getElementById("tweets");
    if (!container) return;

    const div = document.createElement("article");
    div.className = "tweet";
    div.dataset.id = tweet.id;

    div.innerHTML = `
      <div class="avatar" aria-hidden><i class="fa fa-user-circle fa-2x"></i></div>

      <div class="tweet-body">
        <div class="tweet-header">
          <strong>${escapeHtml(tweet.username || "User")}</strong>
          <span class="handle">${escapeHtml(tweet.handle || "@user")} · <time>${timeAgo(tweet.createdAt)}</time></span>
        </div>

        <p>${escapeHtml(tweet.text)}</p>

        <div class="actions">
          <button class="action-btn" data-action="comment" title="Reply" aria-label="Reply"><i class="fa fa-comment"></i></button>
          <button class="action-btn" data-action="retweet" title="Retweet" aria-label="Retweet"><i class="fa fa-retweet"></i> <span>${tweet.retweets || 0}</span></button>
          <button class="action-btn" data-action="like" title="Like" aria-label="Like"><i class="fa fa-heart"></i> <span>${tweet.likes || 0}</span></button>
          <button class="action-btn" data-action="delete" title="Delete" aria-label="Delete"><i class="fa fa-trash"></i></button>
        </div>
      </div>
    `;

    // attach handlers
    const likeBtn = div.querySelector('[data-action="like"]');
    if (likeBtn) likeBtn.addEventListener('click', () => like(tweet.id, likeBtn));

    const rtBtn = div.querySelector('[data-action="retweet"]');
    if (rtBtn) rtBtn.addEventListener('click', () => retweet(tweet.id, rtBtn));

    const delBtn = div.querySelector('[data-action="delete"]');
    if (delBtn) delBtn.addEventListener('click', () => {
      deleteTweet(tweet.id);
    });

    if (prepend) container.prepend(div);
    else container.append(div);
}

// =========================
// LIKE
// =========================

function like(id, el) {
    const tweet = tweets.find(t => t.id === id);
    if (!tweet) return;

    tweet.likes = (tweet.likes || 0) + 1;
    const span = el.querySelector('span');
    if (span) span.innerText = tweet.likes;

    saveTweets();
}

// =========================
// RETWEET
// =========================

function retweet(id, el) {
    const tweet = tweets.find(t => t.id === id);
    if (!tweet) return;

    tweet.retweets = (tweet.retweets || 0) + 1;
    const span = el.querySelector('span');
    if (span) span.innerText = tweet.retweets;

    saveTweets();
}

// =========================
// DELETE
// =========================

function deleteTweet(id) {
    tweets = tweets.filter(t => t.id !== id);
    saveTweets();

    // remove from DOM
    const el = document.querySelector(`.tweet[data-id="${id}"]`);
    if (el && el.parentNode) el.parentNode.removeChild(el);
}

// =========================
// SAVE
// =========================

function saveTweets() {
    localStorage.setItem("tweets", JSON.stringify(tweets));
}

// =========================
// SEARCH / TRENDING FILTER
// =========================

function setupSearch() {
  const input = document.getElementById('searchInput');
  const clearBtn = document.getElementById('clearSearch');
  const searchIcon = document.getElementById('searchIcon');
  const trending = document.querySelector('.trending');

  if (!input || !clearBtn || !trending) return;

  const items = Array.from(trending.querySelectorAll('p'));

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    // show/hide clear button
    if (q.length > 0) clearBtn.classList.add('show');
    else clearBtn.classList.remove('show');

    // filter trending
    items.forEach(p => {
      const text = (p.textContent || '').toLowerCase();
      if (q === "" || text.includes(q)) {
        p.style.display = '';
      } else {
        p.style.display = 'none';
      }
    });
  });

  // clear behavior
  clearBtn.addEventListener('click', () => {
    input.value = '';
    clearBtn.classList.remove('show');
    input.focus();
    // restore items
    items.forEach(p => p.style.display = '');
  });

  // clicking the left icon focuses the input (UX)
  searchIcon.addEventListener('click', () => {
    input.focus();
  });

  // allow pressing Enter to blur (no network search for now)
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') input.blur();
  });
}

// =========================
// UTILITIES
// =========================

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Math.floor((Date.now() - new Date(iso).getTime())/1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff/60)}m`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h`;
  return `${Math.floor(diff/86400)}d`;
}

// Simple escape to avoid XSS when inserting user text
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'", "&#39;");
}