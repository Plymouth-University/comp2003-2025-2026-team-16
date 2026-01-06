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

	// Redirect to Main page.html on submit
	if (loginForm) {
		loginForm.addEventListener('submit', function (e) {
			e.preventDefault();
			// Optionally, add validation here
			window.location.href = 'Main page.html';
		});
	}
});
