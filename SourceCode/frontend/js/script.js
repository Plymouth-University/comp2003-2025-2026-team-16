// Show admin panel button only for admins
document.addEventListener('DOMContentLoaded', function () {
  const user = JSON.parse(localStorage.getItem('doveUser'));
  if (user && user.role === 'Admin') {
    const adminNav = document.getElementById('adminPanelNav');
    if (adminNav) adminNav.style.display = '';
  }
});

if (!localStorage.getItem('doveUser')) window.location.href = 'index.html';

// Initialize search history from localStorage
      let searchHistory = JSON.parse(localStorage.getItem('doveSearchHistory')) || [];
      let currentSearchType = 'personnel';

      // DOM Elements
      const navBtns = document.querySelectorAll('.navBtn');
      const searchBar = document.getElementById('searchBar');
      const searchResults = document.getElementById('searchResults');
      const searchHistory_container = document.getElementById('searchHistory');
      const emptyState = document.getElementById('emptyState');

      // Shared placeholder map
      const placeholderMap = {
        personnel: 'Search personnel...',
        management: 'Search management...',
        'field-agents': 'Search field agents...',
        'undercover-agents': 'Search undercover agents...',
        departments: 'Search departments...',
        intelligence: 'Search intelligence...',
        evidence: 'Search evidence...',
        factions: 'Search factions...',
        operatives: 'Search operatives...',
        suspects: 'Search suspects...',
        locations: 'Search locations...',
        technology: 'Search technology...',
        missions: 'Search missions...',
        active: 'Search active missions...',
        paused: 'Search paused missions...',
        'case-notes': 'Search case notes...',
        'missions-misc': 'Search miscellaneous...',
        archive: 'Search the archive...',
        documents: 'Search documents...',
        'completed-missions': 'Search completed missions...',
        'archive-evidence': 'Search archived evidence...',
        'archive-misc': 'Search miscellaneous...',
        glossary: 'Search the glossary...'
      };

      function setSearchType(type, activeBtn) {
        currentSearchType = type;
        navBtns.forEach(b => b.classList.remove('active'));
        if (activeBtn) activeBtn.classList.add('active');
        searchBar.placeholder = placeholderMap[type] || 'Search the database...';
        searchBar.focus();
        updateSearchResults();
      }

      // Navigation Button Event Listeners
      navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          if (btn.dataset.type === 'agent') return; // ignore agent
          setSearchType(btn.dataset.type, btn);
        });
      });

      // Dropdown link event listeners
      document.querySelectorAll('.navDropdown .dropdownMenu a').forEach(link => {
        link.addEventListener('click', (e) => {
          e.preventDefault();
          const parentBtn = link.closest('.navDropdown').querySelector('.navBtn');
          setSearchType(link.dataset.type, parentBtn);
        });
      });

      // Ensure one nav button is active on load
      if (![...navBtns].some(b => b.classList.contains('active'))) {
        if (navBtns.length > 0) {
          navBtns[0].classList.add('active');
          currentSearchType = navBtns[0].dataset.type || currentSearchType;
          searchBar.placeholder = placeholderMap[currentSearchType] || 'Search the database...';
        }
      }

      // Search Bar Event Listener
      searchBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const query = searchBar.value.trim();
          if (query.length > 0) {
            // Add to search history and perform search
            performSearch();
            // Check if searching for minigames in missions
            const q = query.toLowerCase();
            if (currentSearchType === 'missions' && q === 'circuitbreak') {
              setTimeout(() => {
                window.location.href = 'circuitBreaker.html';
              }, 100);
            } else if (currentSearchType === 'missions' && q === 'safecracker') {
              setTimeout(() => {
                window.location.href = 'safecracker.html';
              }, 100);
            } else if (currentSearchType === 'missions' && (q === 'radio mission' || q === 'radiomission')) {
              setTimeout(() => {
                window.location.href = 'Radio Mission.html';
              }, 100);
            } else {
              setTimeout(() => {
                window.location.href = `details.html?type=${encodeURIComponent(currentSearchType)}&name=${encodeURIComponent(query)}`;
              }, 100);
            }
          }
        }
      });

      searchBar.addEventListener('input', () => {
        updateSearchResults();
      });

      // Perform search and add to history
      function performSearch() {
        const query = searchBar.value.trim();
        if (query.length > 0) {
          const searchEntry = {
            type: currentSearchType,
            name: query,
            timestamp: new Date().toLocaleString()
          };
          
          // Add to history if not already the most recent
          if (searchHistory.length === 0 || 
              searchHistory[0].name !== query || 
              searchHistory[0].type !== currentSearchType) {
            searchHistory.unshift(searchEntry);
            // Keep only last 3 searches
            if (searchHistory.length > 3) {
              searchHistory.pop();
            }
            localStorage.setItem('doveSearchHistory', JSON.stringify(searchHistory));
            updateSearchHistory();
          }
          
          // Fetch results from backend
          const user = JSON.parse(localStorage.getItem('doveUser') || '{}');
          const userRank = user.rank || 'rookie';
          searchResults.innerHTML = `<p>Searching for <strong>${query}</strong> in ${currentSearchType}...</p>`;
          fetch(`https://comp2003-2025-2026-team-16.onrender.com/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(currentSearchType)}&rank=${encodeURIComponent(userRank)}`)
            .then(response => response.json())
            .then(results => {
              if (results.length === 0) {
                searchResults.innerHTML = `<p>No results found for <strong>${query}</strong> in ${currentSearchType}.</p>`;
              } else {
                searchResults.innerHTML = results.map((item, idx) => {
                  // Try to get id or ID field
                  const entryId = item.id || item.ID || idx; // fallback to index if no id
                  const displayName = item.name || item.title || 'Details';
                  const description = item.description || item.content || '';
                  return `<div class="searchResultItem" data-id="${entryId}" data-type="${currentSearchType}" data-name="${displayName}" style="cursor:pointer;">
                    <strong>${displayName}</strong><br>
                    <span>${description}</span>
                  </div>`;
                }).join('');
                // Add click handlers for details navigation
                document.querySelectorAll('.searchResultItem').forEach(item => {
                  item.addEventListener('click', () => {
                    const type = item.getAttribute('data-type');
                    const name = item.getAttribute('data-name');
                    window.location.href = `details.html?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;
                  });
                });
                // If only one result and Enter was pressed, auto-redirect
                if (results.length === 1 && performSearch._enterPressed) {
                  const item = results[0];
                  const type = currentSearchType;
                  const name = item.name || item.title || '';
                  window.location.href = `details.html?type=${encodeURIComponent(type)}&name=${encodeURIComponent(name)}`;
                }
              }
            })
            .catch(() => {
              searchResults.innerHTML = `<p>Error searching database.</p>`;
            });
        }
      }

      // Update search results display
      function updateSearchResults() {
        const query = searchBar.value.trim();
        if (query.length === 0) {
          const labelMap = {
            personnel: 'Personnel',
            intelligence: 'Intelligence',
            missions: 'Missions',
            archive: 'Archive',
            glossary: 'Glossary'
          };
          const label = labelMap[currentSearchType] || 'agents or locations';
          searchResults.innerHTML = `<p>Start searching to find ${label} in the database</p>`;
        } else {
          searchResults.innerHTML = `<p>Searching for "<strong>${query}</strong>"...</p>`;
        }
      }

      // Update search history display
      function updateSearchHistory() {
        if (searchHistory.length === 0) {
          searchHistory_container.innerHTML = '<div id="emptyState">No previous searches yet</div>';
        } else {
          searchHistory_container.innerHTML = searchHistory.map((item, index) => `
            <div class="searchItem" data-index="${index}">
              <div class="searchItem-type">${
                item.type === 'personnel' ? '🕵️ Personnel' :
                item.type === 'intelligence' ? '🔎 Intelligence' :
                item.type === 'missions' ? '📋 Missions' :
                item.type === 'archive' ? '📚 Archive' :
                item.type === 'glossary' ? '📖 Glossary' : '🔍'
              }</div>
              <div class="searchItem-name">${item.name}</div>
              <div style="font-size: 11px; opacity: 0.6; margin-top: 8px;">${item.timestamp}</div>
            </div>
          `).join('');
          
          // Add click handlers to history items
          document.querySelectorAll('.searchItem').forEach(item => {
            item.addEventListener('click', () => {
              const index = item.dataset.index;
              const entry = searchHistory[index];
              searchBar.value = entry.name;
              currentSearchType = entry.type;
              
              // Update navbar
              navBtns.forEach(btn => {
                btn.classList.remove('active');
                if (btn.dataset.type === entry.type) {
                  btn.classList.add('active');
                }
              });
              
              performSearch();
            });
          });
        }
      }

      // Initialize
      updateSearchHistory();
      searchBar.focus();

      // === AGENT CHAT FUNCTIONALITY ===
      document.addEventListener('DOMContentLoaded', () => {
        // Get elements
        const agentBtn = document.querySelector('[data-type="agent"]');
        const agentChat = document.getElementById('agentChat');
        const closeChat = document.getElementById('closeChat');
        const sendChat = document.getElementById('sendChat');
        const chatInput = document.getElementById('chatInput');
        const chatMessages = document.getElementById('chatMessages');

        // Open chat
        agentBtn.addEventListener('click', () => {
          agentChat.classList.remove('hidden');
        });

        // Close chat
        closeChat.addEventListener('click', () => {
          agentChat.classList.add('hidden');
        });

        // Send message
        sendChat.addEventListener('click', sendMessage);

        // Allow Enter key
        chatInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            sendMessage();
          }
        });

        function sendMessage() {
          const text = chatInput.value.trim();
          if (!text) return;

          // User message
          const userMsg = document.createElement('div');
          userMsg.textContent = text;
          userMsg.style.textAlign = 'right';
          chatMessages.appendChild(userMsg);

          // Placeholder AI response
          const botMsg = document.createElement('div');
          botMsg.textContent = "Thinking...";
          chatMessages.appendChild(botMsg);

          chatInput.value = "";
          chatMessages.scrollTop = chatMessages.scrollHeight;

          // Backend hook
          fetch('https://comp2003-2025-2026-team-16.onrender.com/agent', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message: text })
          })
          .then(res => res.json())
          .then(data => {
            botMsg.textContent = data.response || "No response";
          })
          .catch(() => {
            botMsg.textContent = "Error contacting agent.";
          });
        }
      });