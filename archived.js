document.addEventListener('DOMContentLoaded', function() {
  const archivedTabList = document.getElementById('archivedTabList');
  const clearArchivedButton = document.getElementById('clearArchivedButton');

  function renderArchivedTabs(tabs) {
    archivedTabList.innerHTML = '';
    tabs.forEach(function(tab) {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${tab.url}" target="_blank">${tab.title}</a>
        <div class="tags">Tags: ${tab.tags.join(', ')}</div>
        <div class="date">Saved on: ${new Date(tab.savedDate).toLocaleString()}</div>
      `;
      archivedTabList.appendChild(li);
    });
  }

  function clearArchivedTabs() {
    if (confirm('Are you sure you want to clear all archived tabs? This action cannot be undone.')) {
      chrome.storage.local.set({archivedTabs: []}, function() {
        alert('All archived tabs have been cleared.');
        renderArchivedTabs([]);
      });
    }
  }

  chrome.runtime.sendMessage({action: 'getArchivedTabs'}, function(response) {
    renderArchivedTabs(response.tabs);
  });

  clearArchivedButton.addEventListener('click', clearArchivedTabs);
});