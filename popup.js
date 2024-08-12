document.addEventListener('DOMContentLoaded', function() {
  const saveButton = document.getElementById('saveButton');
  const tagInput = document.getElementById('tagInput');
  const existingTags = document.getElementById('existingTags');

  function renderExistingTags(tags) {
    existingTags.innerHTML = '<h3>Existing Tags:</h3>';
    tags.forEach(function(tag) {
      const tagElement = document.createElement('span');
      tagElement.className = 'tag';
      tagElement.textContent = tag;
      tagElement.addEventListener('click', function() {
        addTag(tag);
      });
      existingTags.appendChild(tagElement);
    });
  }

  function addTag(tag) {
    const currentTags = tagInput.value.split(',').map(t => t.trim()).filter(t => t !== '');
    if (!currentTags.includes(tag)) {
      currentTags.push(tag);
      tagInput.value = currentTags.join(', ');
    }
  }

  function saveTab() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      const currentTab = tabs[0];
      const tags = tagInput.value.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
      
      chrome.runtime.sendMessage({
        action: 'saveTab',
        tab: {
          url: currentTab.url,
          title: currentTab.title,
          tags: tags,
          savedDate: new Date().toISOString()
        }
      }, function(response) {
        if (response && response.success) {
          window.close(); // Close the popup after successful save
        } else {
          alert('Error saving tab. Please try again.');
        }
      });
    });
  }

  chrome.runtime.sendMessage({action: 'getExistingTags'}, function(response) {
    renderExistingTags(response.tags);
  });

  saveButton.addEventListener('click', saveTab);

  // Add event listener for Enter key on the entire document
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent default action
      saveTab();
    }
  });

  // Automatically focus the tag input when the popup opens
  tagInput.focus();
});