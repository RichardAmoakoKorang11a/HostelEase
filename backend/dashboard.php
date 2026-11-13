
<?php
session_start();

if (!isset($_SESSION["student_id"])) {
    header("Location: ../src/login.html");
    exit();
}

$student_name = htmlspecialchars($_SESSION["student_name"]);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HostelEase | Student Dashboard</title>
    <link rel="stylesheet" href="../src/style.css">
</head>
<body>

<header>
    <h1>HostelEase</h1>
    <p>Student Dashboard</p>
</header>

<main>
    <section class="form-container">
        <h2>Welcome, <?php echo $student_name; ?>!</h2>

        <p>Welcome to your HostelEase student dashboard.</p>

        <h3>Available Services</h3>

        <p>
            <a href="../src/hostels.html">Browse Available Hostels</a>
        </p>

        <p>
            <a href="../src/bookings.html">View My Bookings</a>
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
