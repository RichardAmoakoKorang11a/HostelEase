
<?php
session_start();

require_once "db.php";

// Protect the page
if (!isset($_SESSION["admin_id"])) {
    header("Location: ../src/admin_login.html");
    exit();
}

$message = "";

// Add a new hostel
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $hostelName = trim($_POST["hostel_name"] ?? "");
    $location = trim($_POST["location"] ?? "");
    $price = filter_input(INPUT_POST, "price", FILTER_VALIDATE_FLOAT);
    $description = trim($_POST["description"] ?? "");
    $availability = $_POST["availability"] ?? "Available";

    if (
        $hostelName === "" ||
        $location === "" ||
        $price === false ||
        $price === null ||
        $price <= 0
    ) {
        $message = "Please enter a valid hostel name, location and price.";

    } elseif (!in_array($availability, ["Available", "Unavailable"], true)) {
        $message = "Invalid availability selection.";

    } else {

        try {
            $stmt = $pdo->prepare("
                INSERT INTO hostels
                (hostel_name, location, price, description, availability)
                VALUES (?, ?, ?, ?, ?)
            ");

            $stmt->execute([
                $hostelName,
                $location,
                $price,
                $description,
                $availability
            ]);

            header("Location: admin_hostels.php?message=added");
            exit();

        } catch (PDOException $e) {
            $message = "Unable to add hostel. Please try again.";
        }
    }
}

if (isset($_GET["message"]) && $_GET["message"] === "added") {
    $message = "Hostel added successfully!";
}

// Retrieve all hostels
try {
    $stmt = $pdo->query("
        SELECT *
        FROM hostels
        ORDER BY hostel_id DESC
    ");

    $hostels = $stmt->fetchAll(PDO::FETCH_ASSOC);

} catch (PDOException $e) {
    die("Unable to retrieve hostel records.");
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Manage Hostels - HostelEase</title>

    <link rel="stylesheet" href="../src/style.css">
</head>

<body>

<header>
    <h1>HostelEase</h1>
    <p>Hostel Management</p>
</header>

<main>

    <section class="form-container">

        <h2>Manage Hostels</h2>

        <p>
            <?= htmlspecialchars($message) ?>
        </p>

        <h3>Add New Hostel</h3>

        <form method="POST" action="admin_hostels.php">

            <label for="hostel_name">Hostel Name</label>
            <input
                type="text"
                id="hostel_name"
                name="hostel_name"
                required
            >

            <label for="location">Location</label>
            <input
                type="text"
                id="location"
                name="location"
                required
            >

            <label for="price">Price (GH₵)</label>
            <input
                type="number"
                id="price"
                name="price"
                min="0.01"
                step="0.01"
                required
            >

            <label for="description">Description</label>
            <textarea
                id="description"
                name="description"
                rows="4"
            ></textarea>

            <label for="availability">Availability</label>
            <select id="availability" name="availability">
                <option value="Available">Available</option>
                <option value="Unavailable">Unavailable</option>
            </select>

            <button type="submit">Add Hostel</button>

        </form>

        <hr>

        <h3>Registered Hostels</h3>

        <?php if (empty($hostels)): ?>

            <p>No hostels have been registered yet.</p>

        <?php else: ?>

            <?php foreach ($hostels as $hostel): ?>

                <article>

                    <h4>
                        <?= htmlspecialchars($hostel["hostel_name"]) ?>
                    </h4>

                    <p>
                        Location:
                        <?= htmlspecialchars($hostel["location"]) ?>
                    </p>

                    <p>
                        Price: GH₵
                        <?= number_format((float)$hostel["price"], 2) ?>
                    </p>

                    <p>
                        Description:
                        <?= htmlspecialchars($hostel["description"] ?? "") ?>
                    </p>

                    <p>
                        Availability:
                        <?= htmlspecialchars($hostel["availability"]) ?>
                    </p>

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
