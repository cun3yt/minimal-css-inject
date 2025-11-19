// 1. Runs automatically on page load
const hostname = window.location.hostname;

// Unique ID for our style element so we can find/update it later
const STYLE_ID = "my-extension-custom-styles";

function injectCSS(css) {
  // Remove existing style tag if it exists (to avoid duplicates or to clear styles)
  const existingStyle = document.getElementById(STYLE_ID);
  if (existingStyle) {
    existingStyle.remove();
  }

  if (!css) return; // If empty, we are done (styles cleared)

  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = css;
  document.head.appendChild(style);
}

// Initial Load: Check storage for this domain
chrome.storage.sync.get([hostname], (result) => {
  if (result[hostname]) {
    injectCSS(result[hostname]);
  }
});

// Listener: Wait for messages from the popup (for live updates without refresh)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateCSS") {
    injectCSS(request.css);
  }
});