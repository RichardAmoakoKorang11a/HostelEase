
<?php
require_once "db.php";

$message = "";

try {
    // Check whether an administrator already exists
    $check = $pdo->query(
        "SELECT COUNT(*) FROM administrators"
    );

    $adminCount = (int) $check->fetchColumn();

    if ($adminCount > 0) {
        die("An administrator account already exists. Setup is disabled.");
    }

    if ($_SERVER["REQUEST_METHOD"] === "POST") {

        $fullName = trim($_POST["full_name"] ?? "");
        $email = trim($_POST["email"] ?? "");
        $password = $_POST["password"] ?? "";
        $confirmPassword = $_POST["confirm_password"] ?? "";

        if (
            empty($fullName) ||
            empty($email) ||
            empty($password) ||
            empty($confirmPassword)
        ) {
            $message = "Please complete all fields.";

        } elseif (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $message = "Enter a valid email address.";

        } elseif (strlen($password) < 8) {
            $message = "Password must contain at least 8 characters.";

        } elseif ($password !== $confirmPassword) {
            $message = "Passwords do not match.";

        } else {

            $hashedPassword = password_hash(
                $password,
                PASSWORD_DEFAULT
            );

            $stmt = $pdo->prepare("
                INSERT INTO administrators
                (full_name, email, password)
                VALUES (?, ?, ?)
            ");

            $stmt->execute([
                $fullName,
                $email,
                $hashedPassword
            ]);

            $message = "Administrator account created successfully. You can now log in.";

        }
    }

} catch (PDOException $e) {
    $message = "Unable to create administrator account. Please try again.";
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Create Administrator - HostelEase</title>
    <link rel="stylesheet" href="../src/style.css">
</head>
<body>

<header>
    <h1>HostelEase</h1>
    <p>Administrator Account Setup</p>
</header>

<main>
    <section class="form-container">

        <h2>Create First Administrator</h2>

        <p><?= htmlspecialchars($message) ?></p>

        <?php if ($adminCount === 0): ?>

            <form method="POST" action="">

                <label for="full_name">Full Name</label>
                <input
                    type="text"
                    id="full_name"
                    name="full_name"
                    required
                >

                <label for="email">Email Address</label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    required
                >

                <label for="password">Password</label>
                <input
                    type="password"
                    id="password"
                    name="password"
                    minlength="8"
                    required
                >

                <label for="confirm_password">Confirm Password</label>
                <input
                    type="password"
                    id="confirm_password"
                    name="confirm_password"
                    minlength="8"
                    required
                >

                <button type="submit">
                    Create Administrator Account
                </button>

            </form>

        <?php endif; ?>

        <p>
            <a href="../src/admin_login.html">
                Administrator Login
            </a>
        </p>

    </section>
</main>

<footer>
    <p>&copy; 2026 HostelEase. All rights reserved.</p>
</footer>

</body>
</html>
