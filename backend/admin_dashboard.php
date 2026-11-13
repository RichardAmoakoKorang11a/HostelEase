
<?php
session_start();

require_once "db.php";

// Protect the administrator dashboard
if (!isset($_SESSION["admin_id"])) {
    header("Location: ../src/admin_login.html");
    exit();
}

$adminName = $_SESSION["admin_name"] ?? "Administrator";

try {
    // Count registered students
    $studentCount = $pdo->query(
        "SELECT COUNT(*) FROM students"
    )->fetchColumn();

    // Count registered hostels
    $hostelCount = $pdo->query(
        "SELECT COUNT(*) FROM hostels"
    )->fetchColumn();

    // Count all bookings
    $bookingCount = $pdo->query(
        "SELECT COUNT(*) FROM bookings"
    )->fetchColumn();

    // Count pending bookings
    $pendingCount = $pdo->query(
        "SELECT COUNT(*) FROM bookings WHERE status = 'Pending'"
    )->fetchColumn();

} catch (PDOException $e) {
    die("Unable to load dashboard information. Please try again later.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Administrator Dashboard - HostelEase</title>

    <link rel="stylesheet" href="../src/style.css">
</head>

<body>

<header>
    <h1>HostelEase</h1>
    <p>Administrator Dashboard</p>
</header>

<main>

    <section class="form-container">

        <h2>
            Welcome, <?= htmlspecialchars($adminName) ?>!
        </h2>

        <p>You are logged in as an administrator.</p>

        <h3>System Overview</h3>

        <p>
            <strong>Total Students:</strong>
            <?= (int)$studentCount ?>
        </p>

        <p>
            <strong>Total Hostels:</strong>
            <?= (int)$hostelCount ?>
        </p>

        <p>
            <strong>Total Bookings:</strong>
            <?= (int)$bookingCount ?>
        </p>

        <p>
            <strong>Pending Bookings:</strong>
            <?= (int)$pendingCount ?>
        </p>

        <hr>

        <h3>Management Menu</h3>

        <p>
            <a href="admin_hostels.php">
                Manage Hostels
            </a>
        </p>

        <p>
            <a href="admin_bookings.php">
                Manage Student Bookings
            </a>
        </p>

        <p>
            <a href="logout.php">
                Student Logout
            </a>
        </p>

        <p>
            <a href="admin_logout.php">
                Administrator Logout
            </a>
        </p>

    </section>

</main>

<footer>
    <p>&copy; 2026 HostelEase. All rights reserved.</p>
</footer>

</body>
</html>
