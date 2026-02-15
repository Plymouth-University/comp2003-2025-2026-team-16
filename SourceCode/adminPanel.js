// Handle Create User form submission with fetch
window.addEventListener('DOMContentLoaded', function() {
    // ...existing code for tab switching...

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
 