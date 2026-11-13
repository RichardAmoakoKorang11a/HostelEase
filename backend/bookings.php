
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
        SELECT
            bookings.booking_id,
            bookings.booking_date,
            bookings.status,
            hostels.hostel_name,
            hostels.location,
            hostels.price
        FROM bookings
        INNER JOIN hostels
            ON bookings.hostel_id = hostels.hostel_id
        WHERE bookings.student_id = ?
        ORDER BY bookings.booking_date DESC
    ");

    $stmt->execute([$studentId]);

    $bookings = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Unable to load your bookings. Please try again later.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>My Bookings - HostelEase</title>

    <link rel="stylesheet" href="../src/style.css">
</head>

<body>

<header>
    <h1>HostelEase</h1>
    <p>My Hostel Bookings</p>
</header>

<main>

    <section class="form-container">

        <h2>My Bookings</h2>

        <?php if (isset($_GET["message"]) && $_GET["message"] === "cancelled"): ?>

            <p style="color: green;">
                Your booking has been cancelled successfully.
            </p>

        <?php endif; ?>

        <?php if (isset($_GET["error"])): ?>

            <p style="color: red;">
                Unable to cancel this booking. It may already be cancelled or approved.
            </p>

        <?php endif; ?>

        <?php if (empty($bookings)): ?>

            <p>You have not made any bookings yet.</p>

        <?php else: ?>

            <?php foreach ($bookings as $booking): ?>

                <article>

                    <h3>
                        <?= htmlspecialchars($booking["hostel_name"]) ?>
                    </h3>

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
                        <strong>Booking Status:</strong>
                        <?= htmlspecialchars($booking["status"]) ?>
                    </p>

                    <?php if ($booking["status"] === "Pending"): ?>

                        <form
                            action="cancel_booking.php"
                            method="POST"
                            onsubmit="return confirm('Are you sure you want to cancel this booking?');"
                        >

                            <input
                                type="hidden"
                                name="booking_id"
                                value="<?= (int)$booking["booking_id"] ?>"
                            >

                            <button type="submit">
                                Cancel Booking
                            </button>

                        </form>

                    <?php elseif ($booking["status"] === "Cancelled"): ?>

                        <p style="color: red;">
                            This booking has been cancelled.
                        </p>

                    <?php else: ?>

                        <p>
                            This booking cannot be cancelled from this page.
                        </p>

                    <?php endif; ?>

                    <hr>

                </article>

            <?php endforeach; ?>

        <?php endif; ?>

        <p>
            <a href="hostels.php">Browse Hostels</a>
        </p>

        <p>
            <a href="dashboard.php">Back to Dashboard</a>
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
