// =========================
// LOGIN / AUTHENTICATION
// =========================

let currentUser = null;

function initializeLogin() {
  // Check if user is already logged in
  const savedUser = localStorage.getItem("currentUser");
  
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
    hideLoginModal();
    updateProfileDisplay();
  } else {
    showLoginModal();
  }
}

function showLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.remove("hidden");
}

function hideLoginModal() {
  const modal = document.getElementById("loginModal");
  if (modal) modal.classList.add("hidden");
}

function handleSignIn() {
  const usernameInput = document.getElementById("usernameInput");
  const handleInput = document.getElementById("handleInput");
  
  if (!usernameInput || !handleInput) return;
  
  const username = usernameInput.value.trim();
  const handle = handleInput.value.trim();
  
  if (username === "" || handle === "") {
    alert("Please enter both username and handle");
    return;
  }
  
  // Save user to localStorage
  currentUser = { username, handle };
  localStorage.setItem("currentUser", JSON.stringify(currentUser));
  
  // Hide modal and update display
  hideLoginModal();
  updateProfileDisplay();
  
  // Clear inputs
  usernameInput.value = "";
  handleInput.value = "";
}

function handleLogout() {
  localStorage.removeItem("currentUser");
  currentUser = null;
  localStorage.removeItem("tweets");
  tweets = [];
  document.getElementById("tweets").innerHTML = "";
  showLoginModal();
}

function updateProfileDisplay() {
  if (!currentUser) return;
  
  const profileUsername = document.getElementById("profileUsername");
  const profileHandle = document.getElementById("profileHandle");
  
  if (profileUsername) profileUsername.textContent = currentUser.username;
  if (profileHandle) profileHandle.textContent = currentUser.handle;
}

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
  // Initialize login first
  initializeLogin();
  
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
  
  // setup login modal handlers
  setupLoginHandlers();
  
  // setup explore modal handlers
  setupExploreHandlers();
});

// =========================
// LOGIN MODAL HANDLERS
// =========================

function setupLoginHandlers() {
  const signInBtn = document.getElementById("signInBtn");
  const usernameInput = document.getElementById("usernameInput");
  const handleInput = document.getElementById("handleInput");
  const logoutBtn = document.getElementById("logoutBtn");
  
  if (signInBtn) {
    signInBtn.addEventListener("click", handleSignIn);
  }
  
  // Allow Enter key to sign in
  if (usernameInput) {
    usernameInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSignIn();
    });
  }
  
  if (handleInput) {
    handleInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") handleSignIn();
    });
  }
  
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }
}

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
    if (!input || !currentUser) return;
    const text = input.value.trim();

    if (text === "") return;

    const tweet = {
        id: Date.now(),
        username: currentUser.username,
        handle: currentUser.handle,
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
// EXPLORE MODAL HANDLERS
// =========================

const trendingTopics = [
  { name: "#JavaScript", count: 245 },
  { name: "#HTML", count: 189 },
  { name: "#CSS", count: 156 },
  { name: "#Frontend", count: 423 },
  { name: "#WebDevelopment", count: 512 },
  { name: "#React", count: 334 },
  { name: "#CodingLife", count: 287 }
];

function setupExploreHandlers() {
  const exploreNav = document.getElementById("exploreNav");
  const exploreModal = document.getElementById("exploreModal");
  const closeExploreBtn = document.getElementById("closeExplore");
  const exploreSearchInput = document.getElementById("exploreSearchInput");
  
  if (exploreNav) {
    exploreNav.addEventListener("click", () => {
      openExploreModal();
    });
  }
  
  if (closeExploreBtn) {
    closeExploreBtn.addEventListener("click", () => {
      closeExploreModal();
    });
  }
  
  // Close modal when clicking outside
  if (exploreModal) {
    exploreModal.addEventListener("click", (e) => {
      if (e.target === exploreModal) {
        closeExploreModal();
      }
    });
  }
  
  if (exploreSearchInput) {
    exploreSearchInput.addEventListener("input", filterExploreList);
  }
  
  // Populate explore list
  populateExploreList();
}

function openExploreModal() {
  const modal = document.getElementById("exploreModal");
  if (modal) modal.classList.remove("hidden");
  populateExploreList();
}

function closeExploreModal() {
  const modal = document.getElementById("exploreModal");
  if (modal) modal.classList.add("hidden");
}

function populateExploreList(filter = "") {
  const exploreList = document.getElementById("exploreList");
  if (!exploreList) return;
  
  exploreList.innerHTML = "";
  
  const filteredTopics = trendingTopics.filter(topic => 
    topic.name.toLowerCase().includes(filter.toLowerCase())
  );
  
  filteredTopics.forEach(topic => {
    const div = document.createElement("div");
    div.className = "explore-item";
    div.innerHTML = `
      <div class="explore-item-name">${topic.name}</div>
      <div class="explore-item-count">${topic.count} Tweets</div>
    `;
    
    div.addEventListener("click", () => {
      filterTweetsByTrend(topic.name);
      closeExploreModal();
    });
    
    exploreList.appendChild(div);
  });
}

function filterExploreList(e) {
  const query = e.target.value.trim();
  populateExploreList(query);
}

function filterTweetsByTrend(trend) {
  const tweetsList = document.getElementById("tweets");
  if (!tweetsList) return;
  
  const allTweets = tweetsList.querySelectorAll(".tweet");
  
  allTweets.forEach(tweet => {
    const tweetText = tweet.querySelector("p").textContent.toLowerCase();
    if (tweetText.includes(trend.toLowerCase())) {
      tweet.style.display = "";
      tweet.style.animation = "none";
      setTimeout(() => {
        tweet.style.animation = "fadeIn 0.3s ease-in";
      }, 10);
    } else {
      tweet.style.display = "none";
    }
  });
}

// Add fade-in animation for filtered tweets
const style = document.createElement("style");
style.textContent = `
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(style);

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
