
<?php

require_once "db.php";

if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $full_name = trim($_POST["full_name"] ?? "");
    $email = trim($_POST["email"] ?? "");
    $phone = trim($_POST["phone"] ?? "");
    $password = $_POST["password"] ?? "";

    if (
        $full_name === "" ||
        !filter_var($email, FILTER_VALIDATE_EMAIL) ||
        $phone === "" ||
        strlen($password) < 8
    ) {
        die("Please provide valid details. Password must be at least 8 characters.");
    }

    try {
        $check = $conn->prepare(
            "SELECT student_id FROM students WHERE email = ?"
        );
        $check->execute([$email]);

        if ($check->fetch()) {
            die("This email is already registered.");
        }

        $hashed_password = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $sql = "INSERT INTO students
                (full_name, email, phone, password)
                VALUES (?, ?, ?, ?)";

        $stmt = $conn->prepare($sql);

        $stmt->execute([
            $full_name,
            $email,
            $phone,
            $hashed_password
        ]);

        echo "Registration successful! ";
        echo '<a href="../src/login.html">Login here</a>';

    } catch (PDOException $e) {
        die("Registration failed. Please try again.");
    }

} else {
    echo "Invalid request.";
}

?>
