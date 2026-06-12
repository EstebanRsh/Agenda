<?php
$monthNames = [
    '',
    'Enero',
    'Febrero',
    'Marzo',
    'Abril',
    'Mayo',
    'Junio',
    'Julio',
    'Agosto',
    'Septiembre',
    'Octubre',
    'Noviembre',
    'Diciembre'
];
$dayNames   = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
$today      = date('Y-m-d');
?>
<main class="calendar-wrapper">
    <div class="calendar">
        <div class="calendar__header">
            <h2 class="calendar__title">
                <span class="calendar__month"><?= $monthNames[$month] ?></span>
                <span class="calendar__year"><?= $year ?></span>
            </h2>
            <div class="calendar__nav">
                <a href="?month=<?= $prevMonth ?>&year=<?= $prevYear ?>" class="nav-btn" aria-label="Mes anterior">&#8249;</a>
                <a href="?month=<?= $nextMonth ?>&year=<?= $nextYear ?>" class="nav-btn" aria-label="Mes siguiente">&#8250;</a>
            </div>
        </div>

        <div class="calendar__grid">
            <?php foreach ($dayNames as $day): ?>
                <div class="calendar__day-name"><?= $day ?></div>
            <?php endforeach; ?>

            <?php
            $offset = $firstDay - 1;
            $prevMonthDays = (int)date('t', mktime(0, 0, 0, $prevMonth, 1, $prevYear));
            for ($i = $offset; $i > 0; $i--):
                $ghostDay = $prevMonthDays - $i + 1;
            ?>
                <div class="calendar__cell calendar__cell--ghost">
                    <span class="cell__number"><?= $ghostDay ?></span>
                </div>
            <?php endfor; ?>

            <?php for ($d = 1; $d <= $daysInMonth; $d++):
                $dateKey  = "$year-" . str_pad($month, 2, '0', STR_PAD_LEFT) . "-" . str_pad($d, 2, '0', STR_PAD_LEFT);
                $isToday  = $dateKey === $today;
                $hasEvent = isset($events[$dateKey]);
                $classes  = 'calendar__cell';
                if ($isToday)  $classes .= ' calendar__cell--today';
                if ($hasEvent) $classes .= ' calendar__cell--has-event';
            ?>
                <div class="<?= $classes ?>">
                    <span class="cell__number"><?= $d ?></span>
                    <?php if ($hasEvent): ?>
                        <div class="cell__events">
                            <?php foreach ($events[$dateKey] as $ev): ?>
                                <span class="cell__event-dot" title="<?= htmlspecialchars($ev['title']) ?>"></span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endfor; ?>

            <?php
            $totalCells = $offset + $daysInMonth;
            $remaining  = 42 - $totalCells;
            for ($i = 1; $i <= $remaining; $i++):
            ?>
                <div class="calendar__cell calendar__cell--ghost">
                    <span class="cell__number"><?= $i ?></span>
                </div>
            <?php endfor; ?>
        </div>
    </div>
</main>