
<?php
session_start();

require_once "db.php";

// Check whether the student is logged in
if (!isset($_SESSION["student_id"])) {
    header("Location: ../src/login.html");
    exit();
}

// Allow POST requests only
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    header("Location: bookings.php");
    exit();
}

$studentId = $_SESSION["student_id"];

$bookingId = filter_input(
    INPUT_POST,
    "booking_id",
    FILTER_VALIDATE_INT
);

// Check the booking ID
if (!$bookingId) {
    header("Location: bookings.php?error=invalid");
    exit();
}

try {

    // Cancel only the student's own pending booking
    $stmt = $pdo->prepare("
        UPDATE bookings
        SET status = 'Cancelled'
        WHERE booking_id = ?
        AND student_id = ?
        AND status = 'Pending'
    ");

    $stmt->execute([$bookingId, $studentId]);

    if ($stmt->rowCount() > 0) {

        header("Location: bookings.php?message=cancelled");
        exit();

    } else {

        header("Location: bookings.php?error=not_cancelled");
        exit();

    }

} catch (PDOException $e) {

    die("Unable to cancel booking. Please try again later.");

}
?>
