
<?php
session_start();

require_once "db.php";

if (!isset($_SESSION["admin_id"])) {
    header("Location: ../src/admin_login.html");
    exit();
}

$message = "";

// Add or update a hostel
if ($_SERVER["REQUEST_METHOD"] === "POST") {

    $action = $_POST["action"] ?? "";

    $hostelName = trim($_POST["hostel_name"] ?? "");
    $location = trim($_POST["location"] ?? "");
    $price = filter_input(INPUT_POST, "price", FILTER_VALIDATE_FLOAT);
    $description = trim($_POST["description"] ?? "");
    $availability = $_POST["availability"] ?? "Available";

    if ($action === "add" || $action === "update") {

        if (
            $hostelName === "" ||
            $location === "" ||
            $price === false ||
            $price === null ||
            $price <= 0
        ) {
            $message = "Please enter valid hostel information.";

        } elseif (!in_array($availability, ["Available", "Unavailable"], true)) {
            $message = "Invalid availability selection.";

        } else {

            try {

                if ($action === "add") {

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

                } elseif ($action === "update") {

                    $hostelId = filter_input(
                        INPUT_POST,
                        "hostel_id",
                        FILTER_VALIDATE_INT
                    );

                    if (!$hostelId) {
                        $message = "Invalid hostel selected.";
                    } else {

                        $stmt = $pdo->prepare("
                            UPDATE hostels
                            SET hostel_name = ?,
                                location = ?,
                                price = ?,
                                description = ?,
                                availability = ?
                            WHERE hostel_id = ?
                        ");

                        $stmt->execute([
                            $hostelName,
                            $location,
                            $price,
                            $description,
                            $availability,
                            $hostelId
                        ]);

                        header("Location: admin_hostels.php?message=updated");
                        exit();
                    }
                }

            } catch (PDOException $e) {
                $message = "Unable to save hostel information.";
            }
        }
    }
}

// Display success messages
if (isset($_GET["message"])) {
    if ($_GET["message"] === "added") {
        $message = "Hostel added successfully!";
    } elseif ($_GET["message"] === "updated") {
        $message = "Hostel updated successfully!";
    }
}

// Get hostel selected for editing
$editHostel = null;

if (isset($_GET["edit"])) {

    $editId = filter_input(
        INPUT_GET,
        "edit",
        FILTER_VALIDATE_INT
    );

    if ($editId) {
        $stmt = $pdo->prepare("
            SELECT * FROM hostels WHERE hostel_id = ?
        ");

        $stmt->execute([$editId]);
        $editHostel = $stmt->fetch(PDO::FETCH_ASSOC);
    }
}

// Retrieve all hostels
try {

    $stmt = $pdo->query("
        SELECT * FROM hostels
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
    <p>Administrator Hostel Management</p>
</header>

<main>

<section class="form-container">

    <h2>Manage Hostels</h2>

    <p><?= htmlspecialchars($message) ?></p>

    <h3>
        <?= $editHostel ? "Edit Hostel" : "Add New Hostel" ?>
    </h3>

    <form method="POST" action="admin_hostels.php">

        <input
            type="hidden"
            name="action"
            value="<?= $editHostel ? "update" : "add" ?>"
        >

        <?php if ($editHostel): ?>
            <input
                type="hidden"
                name="hostel_id"
                value="<?= (int)$editHostel["hostel_id"] ?>"
            >
        <?php endif; ?>

        <label for="hostel_name">Hostel Name</label>

        <input
            type="text"
            id="hostel_name"
            name="hostel_name"
            value="<?= htmlspecialchars($editHostel["hostel_name"] ?? "") ?>"
            required
        >

        <label for="location">Location</label>

        <input
            type="text"
            id="location"
            name="location"
            value="<?= htmlspecialchars($editHostel["location"] ?? "") ?>"
            required
        >

        <label for="price">Price (GH₵)</label>

        <input
            type="number"
            id="price"
            name="price"
            min="0.01"
            step="0.01"
            value="<?= htmlspecialchars((string)($editHostel["price"] ?? "")) ?>"
            required
        >

        <label for="description">Description</label>

        <textarea
            id="description"
            name="description"
            rows="4"
        ><?= htmlspecialchars($editHostel["description"] ?? "") ?></textarea>

        <label for="availability">Availability</label>

        <select id="availability" name="availability">

            <option value="Available"
                <?= ($editHostel["availability"] ?? "Available") === "Available" ? "selected" : "" ?>>
                Available
            </option>

            <option value="Unavailable"
                <?= ($editHostel["availability"] ?? "") === "Unavailable" ? "selected" : "" ?>>
                Unavailable
            </option>

        </select>

        <button type="submit">
            <?= $editHostel ? "Update Hostel" : "Add Hostel" ?>
        </button>

    </form>

    <?php if ($editHostel): ?>
        <p>
            <a href="admin_hostels.php">Cancel Editing</a>
        </p>
    <?php endif; ?>

    <hr>

    <h3>Registered Hostels</h3>

    <?php if (empty($hostels)): ?>

        <p>No hostels registered yet.</p>

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

                <p>
                    <a href="admin_hostels.php?edit=<?= (int)$hostel["hostel_id"] ?>">
                        Edit Hostel
                    </a>
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
