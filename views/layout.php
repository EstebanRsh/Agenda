<?php
$base = rtrim(str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME'])), '/');
?>
<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mi Agenda</title>
    <link rel="stylesheet" href="<?= $base ?>/public/css/base.css">
    <link rel="stylesheet" href="<?= $base ?>/public/css/sidebar.css">
    <link rel="stylesheet" href="<?= $base ?>/public/css/components.css">
    <link rel="stylesheet" href="<?= $base ?>/public/css/app-core.css">
</head>

<body>
    <div class="app-viewport-container">

        <aside class="premium-sidebar">
            <div class="premium-sidebar__header">
                <div class="premium-sidebar__logo"></div>
                <div class="premium-sidebar__brand">Mi Agenda</div>
            </div>

            <nav class="premium-sidebar__nav">
                <a href="#" class="nav-item is-active">
                    <span style="font-size: 1.1rem;">📅</span> Turnos
                </a>
                <a href="#" class="nav-item">
                    <span style="font-size: 1.1rem;">👥</span> Directorio
                </a>
                <a href="#" class="nav-item">
                    <span style="font-size: 1.1rem;">🩺</span> Staff
                </a>
                <a href="#" class="nav-item">
                    <span style="font-size: 1.1rem;">⚙️</span> Ajustes
                </a>
            </nav>

            <div class="premium-sidebar__footer">
                <span class="premium-sidebar__user">Admin Turnos</span>
                <span>En línea • Conectado</span>
            </div>
        </aside>

        <main class="app-main-content">
            <?php require __DIR__ . '/calendar_view.php'; ?>
        </main>
    </div>

    <script>
        const BASE_URL = '<?= $base ?>';
    </script>
    <script src="<?= $base ?>/public/js/main.js" type="module"></script>
</body>

</html>