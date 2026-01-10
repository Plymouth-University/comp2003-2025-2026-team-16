document.addEventListener('DOMContentLoaded', function () {
	const passwordInput = document.getElementById('password');
	const showPasswordBtn = document.getElementById('showPassword');
	const loginForm = document.getElementById('loginForm');

	// Show password for 1 second
	if (showPasswordBtn && passwordInput) {
		showPasswordBtn.addEventListener('click', function () {
			passwordInput.type = 'text';
			showPasswordBtn.setAttribute('aria-pressed', 'true');
			setTimeout(function () {
				passwordInput.type = 'password';
				showPasswordBtn.setAttribute('aria-pressed', 'false');
			}, 1000);
		});
	}

	// Login authentication and store user details
	if (loginForm) {
		loginForm.addEventListener('submit', function (e) {
			e.preventDefault();
			const username = document.getElementById('username').value.trim();
			const password = document.getElementById('password').value;

			// Send credentials to backend for authentication
			fetch('http://localhost:5000/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ username, password })
			})
			.then(response => response.json())
			.then(data => {
				if (data.success) {
					// Store user details in localStorage
					localStorage.setItem('doveUser', JSON.stringify({
						username: data.username,
						rank: data.rank,
						role: data.role
					}));
					window.location.href = 'Main page.html';
				} else {
					// Show error message
					const errorMsg = document.getElementById('errorMsg');
					if (errorMsg) {
						errorMsg.textContent = data.message || 'Login failed.';
					}
				}
			})
			.catch(() => {
				const errorMsg = document.getElementById('errorMsg');
				if (errorMsg) {
					errorMsg.textContent = 'Error connecting to server.';
				}
			});
		});
	}
});
