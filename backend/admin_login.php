
<?php
session_start();

require_once "db.php";

// Allow POST requests only
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: ../src/admin_login.html");
    exit();
}

// Get login details
$email = trim($_POST["email"] ?? "");
$password = $_POST["password"] ?? "";

// Validate input
if (empty($email) || empty($password)) {
    die("Please enter your email and password.");
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    die("Please enter a valid email address.");
}

try {

    // Find administrator by email
    $stmt = $pdo->prepare("
        SELECT admin_id, full_name, email, password
        FROM administrators
        WHERE email = ?
        LIMIT 1
    ");

    $stmt->execute([$email]);

    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    // Verify administrator password
    if ($admin && password_verify($password, $admin["password"])) {

        session_regenerate_id(true);

        $_SESSION["admin_id"] = $admin["admin_id"];
        $_SESSION["admin_name"] = $admin["full_name"];

        header("Location: admin_dashboard.php");
        exit();

    } else {

        die("Invalid administrator email or password.");

    }

} catch (PDOException $e) {

    die("Login failed. Please try again later.");

}
