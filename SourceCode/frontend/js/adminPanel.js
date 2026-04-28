function adminHeaders() {
    var user = JSON.parse(localStorage.getItem('doveUser'));
    return user && user.token ? { 'X-Session-Token': user.token } : {};
}

// Handle Create User form submission with fetch
window.addEventListener('DOMContentLoaded', function() {
    // ...existing code for tab switching...

    // User form
    var userForm = document.querySelector('#form-user form');
    var userMsg = document.createElement('div');
    userMsg.id = 'user-form-message';
    userForm.parentNode.insertBefore(userMsg, userForm);
    userForm.addEventListener('submit', function(e) {
        e.preventDefault();
        userMsg.textContent = '';
        var formData = new FormData(userForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_user', {
            method: 'POST',
            headers: adminHeaders(),
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                userMsg.textContent = 'User created successfully!';
                userMsg.style.color = 'green';
                userForm.reset();
            } else {
                userMsg.textContent = data.message || 'Failed to create user.';
                userMsg.style.color = 'red';
            }
        })
        .catch(() => {
            userMsg.textContent = 'An error occurred.';
            userMsg.style.color = 'red';
        });
    });

    // Agent form
    var agentForm = document.querySelector('#form-agent form');
    var agentMsg = document.createElement('div');
    agentMsg.id = 'agent-form-message';
    agentForm.parentNode.insertBefore(agentMsg, agentForm);
    agentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        agentMsg.textContent = '';
        var formData = new FormData(agentForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_agent', {
            method: 'POST',
            headers: adminHeaders(),
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                agentMsg.textContent = 'Agent created successfully!';
                agentMsg.style.color = 'green';
                agentForm.reset();
            } else {
                agentMsg.textContent = data.message || 'Failed to create agent.';
                agentMsg.style.color = 'red';
            }
        })
        .catch(() => {
            agentMsg.textContent = 'An error occurred.';
            agentMsg.style.color = 'red';
        });
    });

    // Department form
    var departmentForm = document.querySelector('#form-departments form');
    var departmentMsg = document.createElement('div');
    departmentForm.parentNode.insertBefore(departmentMsg, departmentForm);
    departmentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        departmentMsg.textContent = '';
        var formData = new FormData(departmentForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_department', { method: 'POST', headers: adminHeaders(), body: formData })
            .then(r => r.json())
            .then(data => {
                departmentMsg.textContent = data.success ? 'Department created successfully!' : (data.message || 'Failed to create department.');
                departmentMsg.style.color = data.success ? 'green' : 'red';
                if (data.success) departmentForm.reset();
            })
            .catch(() => { departmentMsg.textContent = 'An error occurred.'; departmentMsg.style.color = 'red'; });
    });

    // Faction form
    var factionForm = document.querySelector('#form-factions form');
    var factionMsg = document.createElement('div');
    factionForm.parentNode.insertBefore(factionMsg, factionForm);
    factionForm.addEventListener('submit', function(e) {
        e.preventDefault();
        factionMsg.textContent = '';
        var formData = new FormData(factionForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_faction', { method: 'POST', headers: adminHeaders(), body: formData })
            .then(r => r.json())
            .then(data => {
                factionMsg.textContent = data.success ? 'Faction created successfully!' : (data.message || 'Failed to create faction.');
                factionMsg.style.color = data.success ? 'green' : 'red';
                if (data.success) factionForm.reset();
            })
            .catch(() => { factionMsg.textContent = 'An error occurred.'; factionMsg.style.color = 'red'; });
    });

    // Suspect form
    var suspectForm = document.querySelector('#form-suspects form');
    var suspectMsg = document.createElement('div');
    suspectForm.parentNode.insertBefore(suspectMsg, suspectForm);
    suspectForm.addEventListener('submit', function(e) {
        e.preventDefault();
        suspectMsg.textContent = '';
        var formData = new FormData(suspectForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_suspect', { method: 'POST', headers: adminHeaders(), body: formData })
            .then(r => r.json())
            .then(data => {
                suspectMsg.textContent = data.success ? 'Suspect created successfully!' : (data.message || 'Failed to create suspect.');
                suspectMsg.style.color = data.success ? 'green' : 'red';
                if (data.success) suspectForm.reset();
            })
            .catch(() => { suspectMsg.textContent = 'An error occurred.'; suspectMsg.style.color = 'red'; });
    });

    // Archive form
    var archiveForm = document.querySelector('#form-archive form');
    var archiveMsg = document.createElement('div');
    archiveForm.parentNode.insertBefore(archiveMsg, archiveForm);
    archiveForm.addEventListener('submit', function(e) {
        e.preventDefault();
        archiveMsg.textContent = '';
        var formData = new FormData(archiveForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_archive', { method: 'POST', headers: adminHeaders(), body: formData })
            .then(r => r.json())
            .then(data => {
                archiveMsg.textContent = data.success ? 'Archive entry created successfully!' : (data.message || 'Failed to create archive entry.');
                archiveMsg.style.color = data.success ? 'green' : 'red';
                if (data.success) archiveForm.reset();
            })
            .catch(() => { archiveMsg.textContent = 'An error occurred.'; archiveMsg.style.color = 'red'; });
    });

    // Glossary form
    var glossaryForm = document.querySelector('#form-glossary form');
    var glossaryMsg = document.createElement('div');
    glossaryForm.parentNode.insertBefore(glossaryMsg, glossaryForm);
    glossaryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        glossaryMsg.textContent = '';
        var formData = new FormData(glossaryForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_glossary', { method: 'POST', headers: adminHeaders(), body: formData })
            .then(r => r.json())
            .then(data => {
                glossaryMsg.textContent = data.success ? 'Glossary entry created successfully!' : (data.message || 'Failed to create glossary entry.');
                glossaryMsg.style.color = data.success ? 'green' : 'red';
                if (data.success) glossaryForm.reset();
            })
            .catch(() => { glossaryMsg.textContent = 'An error occurred.'; glossaryMsg.style.color = 'red'; });
    });

    // Location form
    var locationForm = document.querySelector('#form-location form');
    var locationMsg = document.createElement('div');
    locationMsg.id = 'location-form-message';
    locationForm.parentNode.insertBefore(locationMsg, locationForm);
    locationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        locationMsg.textContent = '';
        var formData = new FormData(locationForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/create_location', {
            method: 'POST',
            headers: adminHeaders(),
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                locationMsg.textContent = 'Location created successfully!';
                locationMsg.style.color = 'green';
                locationForm.reset();
            } else {
                locationMsg.textContent = data.message || 'Failed to create location.';
                locationMsg.style.color = 'red';
            }
        })
        .catch(() => {
            locationMsg.textContent = 'An error occurred.';
            locationMsg.style.color = 'red';
        });
    });
});
const formIds = ['user', 'agent', 'location', 'departments', 'factions', 'suspects', 'archive', 'glossary', 'delete'];

function showForm(form) {
    formIds.forEach(id => {
        document.getElementById('form-' + id).style.display = (form === id) ? 'block' : 'none';
    });
    var buttons = document.getElementsByClassName('tab-button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    var idx = formIds.indexOf(form);
    if (idx !== -1) buttons[idx].classList.add('active');
}

// Attach event listeners to tab buttons after DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    var buttons = document.getElementsByClassName('tab-button');
    formIds.forEach(function(id, i) {
        if (buttons[i]) buttons[i].addEventListener('click', function() { showForm(id); });
    });
});


    // Delete form: fetch and display items for selected table
    var deleteForm = document.querySelector('#form-delete form');
    var tableSelect = document.getElementById('delete_table');
    var itemList = document.createElement('div');
    itemList.id = 'delete-item-list';
    deleteForm.parentNode.insertBefore(itemList, deleteForm);

    function renderItems(items) {
        itemList.innerHTML = '';
        if (!items || items.length === 0) {
            itemList.textContent = 'No items found.';
            return;
        }
        var list = document.createElement('ul');
        items.forEach(function(item) {
            var li = document.createElement('li');
            const idField = Object.keys(item).find(k => k.endsWith('_id') || k === 'id');
            const displayName = item.name || item.username || item.title || '—';
            li.textContent = `ID: ${item[idField]}, Name: ${displayName}`;
            list.appendChild(li);
        });
        itemList.appendChild(list);
    }

    function fetchItemsForTable(table) {
        if (!table) {
            itemList.innerHTML = '';
            return;
        }
        fetch(`https://comp2003-2025-2026-team-16.onrender.com/get_items?table=${table}`, {
            headers: adminHeaders()
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    renderItems(data.items);
                } else {
                    itemList.textContent = data.message || 'Failed to fetch items.';
                }
            })
            .catch(() => {
                itemList.textContent = 'An error occurred fetching items.';
            });
    }

    tableSelect.addEventListener('change', function() {
        fetchItemsForTable(tableSelect.value);
    });

    // Initial load for default table
    fetchItemsForTable(tableSelect.value);


    var deleteForm = document.querySelector('#form-delete form');
    var deleteMsg = document.createElement('div');
    deleteMsg.id = 'delete-form-message';
    deleteForm.parentNode.insertBefore(deleteMsg, deleteForm);
    deleteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        deleteMsg.textContent = '';
        var formData = new FormData(deleteForm);
        fetch('https://comp2003-2025-2026-team-16.onrender.com/delete_item', {
            method: 'POST',
            headers: adminHeaders(),
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                deleteMsg.textContent = data.message || 'Item deleted successfully!';
                deleteMsg.style.color = 'green';
                deleteForm.reset();
            } else {
                deleteMsg.textContent = data.message || 'Failed to delete item.';
                deleteMsg.style.color = 'red';
            }
        })
        .catch(() => {
            deleteMsg.textContent = 'An error occurred.';
            deleteMsg.style.color = 'red';
        });
    });
