
<?php
session_start();

require_once "db.php";

if (!isset($_SESSION["student_id"])) {
    header("Location: ../src/login.html");
    exit();
}

try {
    $stmt = $pdo->query(
        "SELECT hostel_id, hostel_name, location, price,
                description, availability
         FROM hostels
         ORDER BY hostel_id DESC"
    );

    $hostels = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Unable to load hostels. Please try again later.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Available Hostels - HostelEase</title>
    <link rel="stylesheet" href="../src/style.css">
</head>
<body>

<header>
    <h1>HostelEase</h1>
    <p>Find Your Student Accommodation</p>
</header>

<main>
    <h2>Available Hostels</h2>

    <?php if (empty($hostels)): ?>
        <p>No hostels are currently listed.</p>
    <?php else: ?>

        <?php foreach ($hostels as $hostel): ?>
            <section class="form-container">
                <h3>
                    <?= htmlspecialchars($hostel["hostel_name"]) ?>
                </h3>

                <p>
                    Location:
                    <?= htmlspecialchars($hostel["location"]) ?>
                </p>

                <p>
                    Price: GH₵
                    <?= number_format((float)$hostel["price"], 2) ?>
                </p>

                <p>
                    <?= htmlspecialchars($hostel["description"] ?? "") ?>
                </p>

                <p>
                    Status:
                    <?= htmlspecialchars($hostel["availability"]) ?>
                </p>

                <?php if ($hostel["availability"] === "Available"): ?>
                    <form action="book.php" method="POST">
                        <input
                            type="hidden"
                            name="hostel_id"
                            value="<?= (int)$hostel["hostel_id"] ?>"
                        >

                        <button type="submit">
                            Book Now
                        </button>
                    </form>
                <?php else: ?>
                    <button type="button" disabled>
                        Not Available
                    </button>
                <?php endif; ?>
            </section>
        <?php endforeach; ?>

    <?php endif; ?>

    <p>
        <a href="dashboard.php">Back to Dashboard</a>
    </p>
</main>

<footer>
    <p>&copy; 2026 HostelEase. All rights reserved.</p>
</footer>

</body>
</html>
