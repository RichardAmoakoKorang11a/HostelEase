
<?php
session_start();

if (!isset($_SESSION["student_id"])) {
    header("Location: ../src/login.html");
    exit();
}

$studentName = $_SESSION["student_name"] ?? "Student";
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - HostelEase</title>
    <link rel="stylesheet" href="../src/style.css">
</head>
<body>

<header>
    <h1>HostelEase</h1>
    <p>Student Accommodation Management System</p>
</header>

<main>
    <section class="form-container">
        <h2>Welcome, <?= htmlspecialchars($studentName) ?>!</h2>

        <p>You have successfully logged into HostelEase.</p>

        <h3>Dashboard Menu</h3>

        <p>
            <a href="hostels.php">View Available Hostels</a>
        </p>

        <p>
            <a href="../src/bookings.html">My Bookings</a>
        </p>

        <p>
            <a href="../src/profile.html">My Profile</a>
        </p>

        <p>
            <a href="logout.php">Logout</a>
        </p>
    </section>
</main>

<footer>
    <p>&copy; 2026 HostelEase. All rights reserved.</p>
</footer>

</body>
</html>
