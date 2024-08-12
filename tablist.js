document.addEventListener('DOMContentLoaded', function() {
  const tagList = document.getElementById('tagList');
  const tabList = document.getElementById('tabList');
  const settingsIcon = document.getElementById('settings-icon');
  const settingsPanel = document.getElementById('settings-panel');
  const exportButton = document.getElementById('exportButton');
  const importButton = document.getElementById('importButton');
  const importFile = document.getElementById('importFile');
  let allTabs = [];
  let allTags = new Set();

  function renderTags() {
    tagList.innerHTML = '';
    allTags.forEach(function(tag) {
      const tagElement = document.createElement('span');
      tagElement.className = 'tag';
      tagElement.textContent = tag;
      tagElement.addEventListener('click', function() {
        filterTabs([tag]);
      });
      tagList.appendChild(tagElement);
    });
  }

  function renderTabs(tabs) {
    tabList.innerHTML = '';
    tabs.forEach(function(tab, index) {
      const li = document.createElement('li');
      li.innerHTML = `
        <a href="${tab.url}" target="_blank">${tab.title}</a>
        <div class="tags">Tags: ${tab.tags.join(', ')}</div>
        <div class="date">Saved on: ${new Date(tab.savedDate).toLocaleString()}</div>
        <button class="archive-button" data-index="${index}">Archive</button>
      `;
      tabList.appendChild(li);
    });

    // Add event listeners to archive buttons
    document.querySelectorAll('.archive-button').forEach(button => {
      button.addEventListener('click', function() {
        const index = this.getAttribute('data-index');
        archiveTab(index);
      });
    });
  }

  function filterTabs(filterTags) {
    const filteredTabs = allTabs.filter(function(tab) {
      if (filterTags.length === 0) return true;
      return tab.tags.some(tag => filterTags.includes(tag.toLowerCase()));
    });
    renderTabs(filteredTabs);
  }

  function archiveTab(index) {
    chrome.runtime.sendMessage({action: 'archiveTab', index: parseInt(index)}, function(response) {
      if (response && response.success) {
        allTabs.splice(index, 1);
        renderTabs(allTabs);
      } else {
        alert('Error archiving tab. Please try again.');
      }
    });
  }
 
  function exportTabs() {
    chrome.storage.local.get({savedTabs: []}, function(result) {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(result.savedTabs));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "saved_tabs.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });
  }

  function importTabs(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const importedTabs = JSON.parse(e.target.result);
          chrome.storage.local.get({savedTabs: []}, function(result) {
            const updatedTabs = [...result.savedTabs, ...importedTabs];
            chrome.storage.local.set({savedTabs: updatedTabs}, function() {
              alert('Tabs imported successfully!');
              location.reload(); // Refresh the page to show imported tabs
            });
          });
        } catch (error) {
          alert('Error importing tabs. Please make sure the file is correct.');
        }
      };
      reader.readAsText(file);
    }
  }

  // Toggle settings panel
  settingsIcon.addEventListener('click', function() {
    settingsPanel.style.display = settingsPanel.style.display === 'none' ? 'block' : 'none';
  });

  // Export functionality
  exportButton.addEventListener('click', exportTabs);

  // Import functionality
  importButton.addEventListener('click', function() {
    importFile.click();
  });

  importFile.addEventListener('change', importTabs);

  chrome.runtime.sendMessage({action: 'getTabs'}, function(response) {
    allTabs = response.tabs;
    allTabs.forEach(tab => {
      tab.tags.forEach(tag => allTags.add(tag.toLowerCase()));
    });
    renderTags();
    renderTabs(allTabs);
  });
});