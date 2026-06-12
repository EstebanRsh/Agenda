const panel     = document.getElementById('dayPanel');
const panelDate = document.getElementById('panelDate');
const closeBtn  = document.getElementById('panelClose');
const layout    = document.querySelector('.app-layout');
let   activeDay = null;

document.querySelectorAll('.calendar__cell--active').forEach(cell => {
    cell.addEventListener('click', () => {
        const date = cell.dataset.date;
        if (activeDay === date && panel.classList.contains('is-open')) {
            closePanel();
        } else {
            document.querySelectorAll('.calendar__cell--selected').forEach(c => c.classList.remove('calendar__cell--selected'));
            cell.classList.add('calendar__cell--selected');
            panelDate.textContent = date;
            activeDay = date;
            panel.classList.add('is-open');
            layout.classList.add('panel-open');
        }
    });
});

closeBtn.addEventListener('click', closePanel);

function closePanel() {
    panel.classList.remove('is-open');
    layout.classList.remove('panel-open');
    document.querySelectorAll('.calendar__cell--selected').forEach(c => c.classList.remove('calendar__cell--selected'));
    activeDay = null;
}