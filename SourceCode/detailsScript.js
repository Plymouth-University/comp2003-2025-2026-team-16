// detailsScript.js
// Fetches and displays details for a single entry using /search route and query params

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

  fetch(`http://localhost:5000/search?q=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`)
    .then(response => response.json())
    .then(results => {
      if (!results || results.length === 0) {
        detailsTitle.textContent = 'Not Found';
        detailsContent.textContent = 'No entry found.';
      } else {
        // Show the first matching result
        const data = results[0];
        detailsTitle.textContent = data.name || data.title || 'Details';
        detailsContent.innerHTML = Object.entries(data)
          .filter(([key]) => key !== 'name' && key !== 'title' && key !== 'id' && key !== 'ID')
          .map(([key, value]) => `<div><strong>${key}:</strong> ${value}</div>`)
          .join('');
      }
    })
    .catch(() => {
      detailsTitle.textContent = 'Error';
      detailsContent.textContent = 'Could not fetch details.';
    });

  backBtn.addEventListener('click', () => {
    window.history.length > 1 ? window.history.back() : window.location.href = 'Main page.html';
  });
});
