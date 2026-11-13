
<?php

session_start();

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $email = trim($_POST["email"] ?? "");
    $password = $_POST["password"] ?? "";

    if (!filter_var($email, FILTER_VALIDATE_EMAIL) || $password === "") {
        die("Please enter a valid email and password.");
    }

    try {
        $sql = "SELECT student_id, full_name, email, password
                FROM students
                WHERE email = ?";

        $stmt = $conn->prepare($sql);
        $stmt->execute([$email]);

        $student = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($student && password_verify($password, $student["password"])) {

            session_regenerate_id(true);

            $_SESSION["student_id"] = $student["student_id"];
            $_SESSION["student_name"] = $student["full_name"];

            header("Location: dashboard.php");
            exit();

        } else {
            die("Incorrect email or password. Please try again.");
        }

    } catch (PDOException $e) {
        die("Login failed. Please try again.");
    }

} else {
    echo "Invalid request.";
}

?>
