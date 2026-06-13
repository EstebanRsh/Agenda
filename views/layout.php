<?php
$base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Consultorio</title>
    <link rel="stylesheet" href="<?= $base ?>/public/css/style.css">
</head>

<body>
    <?php require __DIR__ . '/calendar_view.php'; ?>
    <script>
        const BASE_URL = '<?= $base ?>';
    </script>
    <script src="<?= $base ?>/public/js/main.js"></script>
</body>

</html>