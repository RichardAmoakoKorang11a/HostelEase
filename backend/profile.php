
<?php
session_start();

require_once "db.php";

if (!isset($_SESSION["student_id"])) {
    header("Location: ../src/login.html");
    exit();
}

$studentId = $_SESSION["student_id"];

try {
    $stmt = $pdo->prepare("
        SELECT student_id, full_name, email, phone
        FROM students
        WHERE student_id = ?
    ");

    $stmt->execute([$studentId]);

    $student = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$student) {
        session_destroy();
        header("Location: ../src/login.html");
        exit();
    }

} catch (PDOException $e) {
    die("Unable to load your profile. Please try again later.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Profile - HostelEase</title>
    <link rel="stylesheet" href="../src/style.css">
</head>
<body>

<header>
    <h1>HostelEase</h1>
    <p>Student Profile</p>
</header>

<main>
    <section class="form-container">
        <h2>My Profile</h2>

        <p>
            <strong>Student ID:</strong>
            <?= htmlspecialchars((string)$student["student_id"]) ?>
        </p>

        <p>
            <strong>Full Name:</strong>
            <?= htmlspecialchars($student["full_name"]) ?>
        </p>

        <p>
            <strong>Email Address:</strong>
            <?= htmlspecialchars($student["email"]) ?>
        </p>

        <p>
            <strong>Phone Number:</strong>
            <?= htmlspecialchars($student["phone"] ?? "Not provided") ?>
        </p>

        <p><a href="dashboard.php">Back to Dashboard</a></p>
        <p><a href="logout.php">Logout</a></p>
    </section>
</main>

<footer>
    <p>&copy; 2026 HostelEase. All rights reserved.</p>
</footer>

</body>
</html>
