// Initialize search history from localStorage
      let searchHistory = JSON.parse(localStorage.getItem('doveSearchHistory')) || [];
      let currentSearchType = 'agents';

      // DOM Elements
      const navBtns = document.querySelectorAll('.navBtn');
      const searchBar = document.getElementById('searchBar');
      const searchResults = document.getElementById('searchResults');
      const searchHistory_container = document.getElementById('searchHistory');
      const emptyState = document.getElementById('emptyState');

      // Navigation Button Event Listeners
      navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          navBtns.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          currentSearchType = btn.dataset.type;
          const placeholderMap = {
            agents: 'Search for an agent...',
            locations: 'Search for a location...',
            deparments: 'Search for a department...',
            archives: 'Search the archive...'
          };
          searchBar.placeholder = placeholderMap[currentSearchType] || 'Search the database...';
          searchBar.focus();
          updateSearchResults();
        });
      });

      // Ensure one nav button is active on load
      if (![...navBtns].some(b => b.classList.contains('active'))) {
        if (navBtns.length > 0) {
          navBtns[0].classList.add('active');
          currentSearchType = navBtns[0].dataset.type || currentSearchType;
          const placeholderMap = {
            agents: 'Search for an agent...',
            locations: 'Search for a location...',
            deparments: 'Search for a department...',
            archives: 'Search the archive...'
          };
          searchBar.placeholder = placeholderMap[currentSearchType] || 'Search the database...';
        }
      }

      // Search Bar Event Listener
      searchBar.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          performSearch();
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
            // Keep only last 10 searches
            if (searchHistory.length > 10) {
              searchHistory.pop();
            }
            localStorage.setItem('doveSearchHistory', JSON.stringify(searchHistory));
            updateSearchHistory();
          }
          
          // Fetch results from backend
          searchResults.innerHTML = `<p>Searching for <strong>${query}</strong> in ${currentSearchType}...</p>`;
          fetch(`http://localhost:5000/search?q=${encodeURIComponent(query)}&type=${encodeURIComponent(currentSearchType)}`)
            .then(response => response.json())
            .then(results => {
              if (results.length === 0) {
                searchResults.innerHTML = `<p>No results found for <strong>${query}</strong> in ${currentSearchType}.</p>`;
              } else {
                searchResults.innerHTML = results.map(item => `
                  <div class="searchResultItem">
                    <strong>${item.name || item.title}</strong><br>
                    <span>${item.description || item.content || ''}</span>
                  </div>
                `).join('');
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
          searchResults.innerHTML = `<p>Start searching to find ${currentSearchType} in the database</p>`;
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
              <div class="searchItem-type">${item.type === 'agents' ? '🕵️ Agent' : 'locations' ? '📍 Location' : 'departments' ? '🏢 Department' : 'archives' ? '📚 Archive' : ''}</div>
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