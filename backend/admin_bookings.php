
<?php
session_start();

require_once "db.php";

// Protect the administrator page
if (!isset($_SESSION["admin_id"])) {
    header("Location: ../src/admin_login.html");
    exit();
}

$message = "";

// Process booking status updates
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $bookingId = filter_input(
        INPUT_POST,
        "booking_id",
        FILTER_VALIDATE_INT
    );

    $newStatus = $_POST["status"] ?? "";

    if (
        !$bookingId ||
        !in_array($newStatus, ["Approved", "Rejected"], true)
    ) {
        $message = "Invalid booking update.";

    } else {

        try {
            $stmt = $pdo->prepare("
                UPDATE bookings
                SET status = ?
                WHERE booking_id = ?
                AND status = 'Pending'
            ");

            $stmt->execute([$newStatus, $bookingId]);

            if ($stmt->rowCount() > 0) {
                header("Location: admin_bookings.php?message=updated");
                exit();
            }

            $message = "This booking could not be updated. It may no longer be pending.";

        } catch (PDOException $e) {
            $message = "Unable to update booking. Please try again.";
        }
    }
}

if (isset($_GET["message"]) && $_GET["message"] === "updated") {
    $message = "Booking status updated successfully!";
}

// Retrieve all bookings
try {
    $stmt = $pdo->query("
        SELECT
            bookings.booking_id,
            bookings.booking_date,
            bookings.status,
            students.full_name,
            students.email,
            hostels.hostel_name,
            hostels.location,
            hostels.price
        FROM bookings
        INNER JOIN students
            ON bookings.student_id = students.student_id
        INNER JOIN hostels
            ON bookings.hostel_id = hostels.hostel_id
        ORDER BY bookings.booking_date DESC
    ");

    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Unable to retrieve booking records.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Manage Bookings - HostelEase</title>

    <link rel="stylesheet" href="../src/style.css">
</head>

<body>

<header>
    <h1>HostelEase</h1>
    <p>Administrator Booking Management</p>
</header>

<main>

    <section class="form-container">

        <h2>Manage Student Bookings</h2>

        <p><?= htmlspecialchars($message) ?></p>

        <?php if (empty($bookings)): ?>

            <p>No student bookings have been made yet.</p>

        <?php else: ?>

            <?php foreach ($bookings as $booking): ?>

                <article>

                    <h3>
                        Booking #<?= (int)$booking["booking_id"] ?>
                    </h3>

                    <p>
                        <strong>Student:</strong>
                        <?= htmlspecialchars($booking["full_name"]) ?>
                    </p>

                    <p>
                        <strong>Email:</strong>
                        <?= htmlspecialchars($booking["email"]) ?>
                    </p>

                    <p>
                        <strong>Hostel:</strong>
                        <?= htmlspecialchars($booking["hostel_name"]) ?>
                    </p>

                    <p>
                        <strong>Location:</strong>
                        <?= htmlspecialchars($booking["location"]) ?>
                    </p>

                    <p>
                        <strong>Price:</strong>
                        GH₵ <?= number_format((float)$booking["price"], 2) ?>
                    </p>

                    <p>
                        <strong>Booking Date:</strong>
                        <?= htmlspecialchars($booking["booking_date"]) ?>
                    </p>

                    <p>
                        <strong>Status:</strong>
                        <?= htmlspecialchars($booking["status"]) ?>
                    </p>

                    <?php if ($booking["status"] === "Pending"): ?>

                        <form method="POST" action="admin_bookings.php">

                            <input
                                type="hidden"
                                name="booking_id"
                                value="<?= (int)$booking["booking_id"] ?>"
                            >

                            <button
                                type="submit"
                                name="status"
                                value="Approved"
                            >
                                Approve Booking
                            </button>

                            <button
                                type="submit"
                                name="status"
                                value="Rejected"
                            >
                                Reject Booking
                            </button>

                        </form>

                    <?php endif; ?>

                    <hr>

                </article>

            <?php endforeach; ?>

        <?php endif; ?>

        <p>
            <a href="admin_dashboard.php">Back to Dashboard</a>
        </p>

        <p>
            <a href="admin_logout.php">Logout</a>
        </p>

    </section>

</main>

<footer>
    <p>&copy; 2026 HostelEase. All rights reserved.</p>
</footer>

</body>
</html>
