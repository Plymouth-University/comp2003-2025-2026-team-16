document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const type = params.get('type');
  const name = params.get('name');
  const detailsTitle = document.getElementById('detailsTitle');
  const detailsContent = document.getElementById('detailsContent');
  const backBtn = document.getElementById('backBtn');

  if (!type || !name) {
    detailsTitle.textContent = 'Invalid details link';
    detailsContent.textContent = 'Missing type or name.';
    return;
  }

  detailsTitle.textContent = 'Loading...';
  detailsContent.textContent = '';

  const user = JSON.parse(localStorage.getItem('doveUser') || '{}');
  const userRank = user.rank || 'nester';

  // Fields to never display as rows
  const hiddenFields = new Set(['name', 'title', 'id', 'ID', 'img', 'min_rank_required', 'agent_id', 'type', 'locked']);

  // Human-readable labels for known fields
  const fieldLabels = {
    type: 'Classification',
    description: 'Description',
    min_rank_required: 'Minimum Rank',
    status: 'Status',
    department: 'Department',
    location: 'Location',
    faction: 'Faction',
  };

  fetch(`https://comp2003-2025-2026-team-16.onrender.com/search?q=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}&rank=${encodeURIComponent(userRank)}`)
    .then(response => response.json())
    .then(results => {
      if (!results || results.length === 0) {
        detailsTitle.textContent = 'Not Found';
        detailsContent.textContent = 'No entry found.';
        return;
      }

      const data = results[0];
      detailsTitle.textContent = data.name || data.title || 'Details';

      const imgUrl = data.img;
      const fields = Object.entries(data).filter(([key]) => !hiddenFields.has(key));

      detailsContent.innerHTML = `
        <div class="fileCard">
          ${imgUrl ? `<div class="fileImg"><img src="${imgUrl}" alt="Image of ${data.name || 'entry'}"></div>` : ''}
          <div class="fileFields">
            ${fields.map(([key, value]) => `
              <div class="fileRow">
                <span class="fileLabel">${fieldLabels[key] || key.replace(/_/g, ' ')}</span>
                <span class="fileValue">${value !== null && value !== '' ? value : '—'}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    })
    .catch(() => {
      detailsTitle.textContent = 'Error';
      detailsContent.textContent = 'Could not fetch details.';
    });

  backBtn.addEventListener('click', () => {
    window.history.length > 1 ? window.history.back() : window.location.href = 'Main page.html';
  });
});
