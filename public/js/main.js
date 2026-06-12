const panel = document.getElementById("dayPanel");
const panelDate = document.getElementById("panelDate");
const panelBody = document.getElementById('panelBody');
const closeBtn = document.getElementById("panelClose");
const layout = document.querySelector(".app-layout");
let activeDay = null;

document.querySelectorAll(".calendar__cell--active").forEach((cell) => {
  cell.addEventListener("click", () => {
    const date = cell.dataset.date;
    if (activeDay === date && panel.classList.contains("is-open")) {
      closePanel();
    } else {
      document
        .querySelectorAll(".calendar__cell--selected")
        .forEach((c) => c.classList.remove("calendar__cell--selected"));
      cell.classList.add("calendar__cell--selected");
      activeDay = date;
      panelDate.textContent = formatDate(date);
      panel.classList.add("is-open");
      layout.classList.add("panel-open");
      loadAppointments(date);
    }
  });
});

closeBtn.addEventListener("click", closePanel);

function closePanel() {
  panel.classList.remove("is-open");
  layout.classList.remove("panel-open");
  document
    .querySelectorAll(".calendar__cell--selected")
    .forEach((c) => c.classList.remove("calendar__cell--selected"));
  activeDay = null;
}

// — Turnos —
async function loadAppointments(date) {
  panelBody.innerHTML = '<p class="panel-loading">Cargando...</p>';
  const res = await fetch(`/?action=list&date=${date}`);
  const data = await res.json();
  renderAppointments(data);
}

function renderAppointments(list) {
  if (!list.length) {
    panelBody.innerHTML =
      '<p class="panel-empty">Sin turnos para este día.</p>';
    return;
  }
  panelBody.innerHTML = list
    .map(
      (a) => `
        <div class="appointment-card" data-id="${a.id}">
            <div class="appointment-card__row">
                <span class="appointment-card__time">${a.time_start.slice(0, 5)} — ${a.time_end.slice(0, 5)}</span>
                <span class="appointment-card__name">${a.patient_name}</span>
                <span class="appointment-card__doctor">${a.doctor || "—"}</span>
                <button class="appointment-card__toggle" aria-label="Ver detalle">&#8250;</button>
            </div>
            <div class="appointment-card__detail">
                ${a.social_work ? `<div class="detail-row"><span class="detail-label">Obra social</span><span>${a.social_work}</span></div>` : ""}
                ${a.phone ? `<div class="detail-row"><span class="detail-label">Teléfono</span><span>${a.phone}</span></div>` : ""}
                ${a.payment ? `<div class="detail-row"><span class="detail-label">Abono</span><span>$${parseFloat(a.payment).toFixed(2)}</span></div>` : ""}
                ${a.notes ? `<div class="detail-row"><span class="detail-label">Notas</span><span>${a.notes}</span></div>` : ""}
                <div class="detail-actions">
                    <button class="btn btn--danger btn--sm appointment-card__delete" data-id="${a.id}">Eliminar turno</button>
                </div>
            </div>
        </div>
    `,
    )
    .join("");

  panelBody.querySelectorAll(".appointment-card__row").forEach((row) => {
    row.addEventListener("click", () => {
      const card = row.closest(".appointment-card");
      const isOpen = card.classList.contains("is-open");
      panelBody
        .querySelectorAll(".appointment-card.is-open")
        .forEach((c) => c.classList.remove("is-open"));
      if (!isOpen) card.classList.add("is-open");
    });
  });

  panelBody.querySelectorAll(".appointment-card__delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteAppointment(btn.dataset.id);
    });
  });
}

async function deleteAppointment(id) {
  const fd = new FormData();
  fd.append("id", id);
  await fetch("/?action=delete", { method: "POST", body: fd });
  loadAppointments(activeDay);
}

// — Modal —
const modal = document.getElementById("modalOverlay");
const modalDate = document.getElementById("modalDate");
const modalClose = document.getElementById("modalClose");
const modalCancel = document.getElementById("modalCancel");
const modalSave = document.getElementById("modalSave");

document.getElementById("btnAddAppointment").addEventListener("click", () => {
  modalDate.textContent = formatDate(activeDay);
  modal.classList.add("is-open");
});

[modalClose, modalCancel].forEach((el) =>
  el.addEventListener("click", closeModal),
);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.classList.remove("is-open");
  clearModal();
}

function clearModal() {
  [
    "patientName",
    "phone",
    "timeStart",
    "timeEnd",
    "socialWork",
    "payment",
    "doctor",
    "notes",
  ].forEach((id) => (document.getElementById(id).value = ""));
}

modalSave.addEventListener("click", async () => {
  const fd = new FormData();
  fd.append(
    "patient_name",
    document.getElementById("patientName").value.trim(),
  );
  fd.append("phone", document.getElementById("phone").value.trim());
  fd.append("time_start", document.getElementById("timeStart").value);
  fd.append("time_end", document.getElementById("timeEnd").value);
  fd.append("social_work", document.getElementById("socialWork").value.trim());
  fd.append("payment", document.getElementById("payment").value || 0);
  fd.append("doctor", document.getElementById("doctor").value.trim());
  fd.append("notes", document.getElementById("notes").value.trim());
  fd.append("date", activeDay);

  if (!fd.get("patient_name") || !fd.get("time_start") || !fd.get("time_end")) {
    alert("Paciente, hora inicio y hora fin son obligatorios.");
    return;
  }

  const res = await fetch("/?action=create", { method: "POST", body: fd });
  const data = await res.json();
  if (data.success) {
    closeModal();
    loadAppointments(activeDay);
  }
});

// — Utils —
function formatDate(dateStr) {
  const [y, m, d] = dateStr.split("-");
  const months = [
    "",
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  return `${parseInt(d)} de ${months[parseInt(m)]} ${y}`;
}
