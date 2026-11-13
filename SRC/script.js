
// HostelEase Form Validation

document.addEventListener("DOMContentLoaded", function () {

    // Registration form validation
    const registerForm = document.getElementById("registerForm");

    if (registerForm) {
        registerForm.addEventListener("submit", function (event) {
            const password = document.getElementById("password").value;
            const confirmPassword = document.getElementById("confirmPassword").value;

            if (password.length < 8) {
                event.preventDefault();
                alert("Password must contain at least 8 characters.");
                return;
            }

            if (password !== confirmPassword) {
                event.preventDefault();
                alert("Passwords do not match.");
            }
        });
    }

    // Login form validation
    const loginForm = document.getElementById("loginForm");

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            if (email === "" || password === "") {
                event.preventDefault();
                alert("Please enter your email and password.");
            }
        });
    }

});
