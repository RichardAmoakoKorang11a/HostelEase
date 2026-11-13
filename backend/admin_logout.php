
<?php
session_start();

// Remove administrator session information
unset($_SESSION["admin_id"]);
unset($_SESSION["admin_name"]);

// Destroy the session
session_destroy();

// Redirect to administrator login
header("Location: ../src/admin_login.html");
exit();
?>
