document.addEventListener('DOMContentLoaded', async () => {
  const textarea = document.getElementById('cssInput');
  const saveBtn = document.getElementById('saveBtn');
  const hostLabel = document.getElementById('hostname');
  const status = document.getElementById('status');

  // Helper to get current active tab
  async function getCurrentTab() {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  const tab = await getCurrentTab();
  
  // Extract hostname (domain) from the URL
  if (!tab.url) return;
  const url = new URL(tab.url);
  const hostname = url.hostname;

  hostLabel.textContent = `(${hostname})`;

  // Load saved CSS for this specific hostname
  chrome.storage.sync.get([hostname], (result) => {
    if (result[hostname]) {
      textarea.value = result[hostname];
    }
  });

  // Save and Inject logic
  saveBtn.addEventListener('click', () => {
    const cssCode = textarea.value;

    // 1. Save to storage (persistence)
    chrome.storage.sync.set({ [hostname]: cssCode }, () => {
      
      // Show "Saved" status
      status.style.opacity = '1';
      setTimeout(() => { status.style.opacity = '0'; }, 1500);

      // 2. Inject immediately into the current page (Live update)
      chrome.scripting.insertCSS({
        target: { tabId: tab.id },
        css: cssCode
      });
      
      // Also send a message to the content script to update its internal style tag
      // This ensures if we delete CSS, it removes the tag rather than just stacking new CSS
      chrome.tabs.sendMessage(tab.id, { 
        action: "updateCSS", 
        css: cssCode 
      });
    });
  });
});