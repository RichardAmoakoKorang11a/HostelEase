
// HostelEase JavaScript

document.addEventListener("DOMContentLoaded", function () {

    // Welcome message
    console.log("Welcome to HostelEase!");

    // Booking button functionality
    const bookingButtons = document.querySelectorAll(".hostel-card button");

    bookingButtons.forEach(function (button) {

        button.addEventListener("click", function () {

            alert("Thank you for choosing HostelEase! Online booking is currently under development.");

        });

    });

    // Navigation message
    const links = document.querySelectorAll("nav a");

    links.forEach(function (link) {

        link.addEventListener("click", function () {
            console.log("You selected: " + link.textContent);
        });

    });

});
