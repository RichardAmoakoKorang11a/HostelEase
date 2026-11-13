
<?php

session_start();

require_once "db.php";

// Check whether the student is logged in
if (!isset($_SESSION["student_id"])) {
    header("Location: ../src/login.html");
    exit();
}

// Accept only POST requests
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    die("Invalid request.");
}

// Get hostel ID
$hostel_id = filter_input(
    INPUT_POST,
    "hostel_id",
    FILTER_VALIDATE_INT
);

if (!$hostel_id) {
    die("Invalid hostel selection.");
}

try {

    // Check whether the selected hostel exists
    // and is available
    $check = $conn->prepare(
        "SELECT hostel_id FROM hostels
         WHERE hostel_id = ?
         AND availability = 'Available'"
    );

    $check->execute([$hostel_id]);

    if (!$check->fetch()) {
        die("This hostel is unavailable.");
    }

    // Save the booking
    $sql = "INSERT INTO bookings
            (student_id, hostel_id, status)
            VALUES (?, ?, 'Pending')";

    $stmt = $conn->prepare($sql);

    $stmt->execute([
        $_SESSION["student_id"],
        $hostel_id
    ]);

    echo "Your hostel booking request was submitted successfully!";

    echo '<p><a href="../src/bookings.html">
          View My Bookings</a></p>';

} catch (PDOException $e) {

    die("Booking failed. Please try again.");

}

?>
