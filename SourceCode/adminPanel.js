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
        fetch('http://127.0.0.1:5000/create_user', {
            method: 'POST',
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
        fetch('http://127.0.0.1:5000/create_agent', {
            method: 'POST',
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

    // Location form
    var locationForm = document.querySelector('#form-location form');
    var locationMsg = document.createElement('div');
    locationMsg.id = 'location-form-message';
    locationForm.parentNode.insertBefore(locationMsg, locationForm);
    locationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        locationMsg.textContent = '';
        var formData = new FormData(locationForm);
        fetch('http://127.0.0.1:5000/create_location', {
            method: 'POST',
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
function showForm(form) {
    document.getElementById('form-user').style.display = (form === 'user') ? 'block' : 'none';
    document.getElementById('form-agent').style.display = (form === 'agent') ? 'block' : 'none';
    document.getElementById('form-location').style.display = (form === 'location') ? 'block' : 'none';
    var buttons = document.getElementsByClassName('tab-button');
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].classList.remove('active');
    }
    if (form === 'user') buttons[0].classList.add('active');
    if (form === 'agent') buttons[1].classList.add('active');
    if (form === 'location') buttons[2].classList.add('active');
}

// Attach event listeners to tab buttons after DOM is loaded
window.addEventListener('DOMContentLoaded', function() {
    var buttons = document.getElementsByClassName('tab-button');
    if (buttons.length === 3) {
        buttons[0].addEventListener('click', function() { showForm('user'); });
        buttons[1].addEventListener('click', function() { showForm('agent'); });
        buttons[2].addEventListener('click', function() { showForm('location'); });
    }
});
 