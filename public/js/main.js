const panel = document.getElementById("dayPanel");
const panelDate = document.getElementById("panelDate");
const panelBody = document.getElementById("panelBody");
const closeBtn = document.getElementById("panelClose");
const layout = document.querySelector(".app-layout");
let activeDay = null;
let currentFilterStatus = null;

// Manejo de clics en celdas activas del calendario
document.querySelectorAll(".calendar__cell--active").forEach((cell) => {
  cell.addEventListener("click", () => {
    const date = cell.dataset.date;
    if (
      activeDay === date &&
      panel.classList.contains("is-open") &&
      !currentFilterStatus
    ) {
      closePanel();
    } else {
      openPanelForDate(cell, date, null);
    }
  });
});

// Manejo de clics y hover en los badges de estado del calendario
document.querySelectorAll(".cell__status-badge").forEach((badge) => {
  badge.addEventListener("click", (e) => {
    e.stopPropagation();
    const date = badge.dataset.date;
    const status = badge.dataset.status;
    const cell = badge.closest(".calendar__cell--active");
    openPanelForDate(cell, date, status);
  });

  badge.addEventListener("mouseenter", async () => {
    if (badge.dataset.loadedNames) return;
    const date = badge.dataset.date;
    const status = badge.dataset.status;
    const originalTitle = badge.getAttribute("title");

    try {
      const res = await fetch(`${BASE_URL}/?action=list&date=${date}`);
      const data = await res.json();
      const filtered = data.filter((a) => slugify(a.status) === status);
      const names = filtered.map((a) => a.patient_name).join(", ");
      if (names) {
        badge.setAttribute("title", `${originalTitle} \n(${names})`);
        badge.dataset.loadedNames = "true";
      }
    } catch (err) {
      console.error(err);
    }
  });
});

// Abre el panel lateral para una fecha específica
function openPanelForDate(cell, date, statusFilter) {
  document
    .querySelectorAll(".calendar__cell--selected")
    .forEach((c) => c.classList.remove("calendar__cell--selected"));
  cell.classList.add("calendar__cell--selected");
  activeDay = date;
  currentFilterStatus = statusFilter;

  const dateFormatted = formatDate(date);
  panelDate.innerHTML = statusFilter
    ? `${dateFormatted} <span style="font-size:0.8rem; font-weight:normal; display:block; color:#666;">Filtrado: ${statusFilter.replace("-", " ")}</span>`
    : dateFormatted;

  panel.classList.add("is-open");
  layout.classList.add("panel-open");
  loadAppointments(date, statusFilter);
}

closeBtn.addEventListener("click", closePanel);

// Cierra el panel lateral
function closePanel() {
  panel.classList.remove("is-open");
  layout.classList.remove("panel-open");
  document
    .querySelectorAll(".calendar__cell--selected")
    .forEach((c) => c.classList.remove("calendar__cell--selected"));
  activeDay = null;
  currentFilterStatus = null;
}

// Carga los turnos desde la API
async function loadAppointments(date, filterStatus = null) {
  panelBody.innerHTML =
    '<p class="panel-loading">Cargando tablero operativo...</p>';
  try {
    const res = await fetch(`${BASE_URL}/?action=list&date=${date}`);
    const data = await res.json();
    renderDashboardAndAppointments(data, filterStatus);
  } catch (err) {
    panelBody.innerHTML =
      '<p class="panel-empty">Error al cargar datos de la jornada.</p>';
    console.error(err);
  }
}

// Renderiza el control de consultorio y el listado de turnos
function renderDashboardAndAppointments(allAppointments, filterStatus) {
  const scheduledCount = allAppointments.filter(
    (a) => a.status !== "Cancelado",
  ).length;
  const waitingList = allAppointments.filter(
    (a) => a.status === "En sala de espera",
  );
  const inProgressList = allAppointments.filter(
    (a) => a.status === "En atención",
  );
  const completedCount = allAppointments.filter(
    (a) => a.status === "Finalizado",
  ).length;
  const cancelledCount = allAppointments.filter(
    (a) => a.status === "Cancelado",
  ).length;

  const currentPatient =
    inProgressList.length > 0
      ? inProgressList[0].patient_name
      : "Ninguno (Consultorio libre)";
  const upcomingAppointments = allAppointments.filter(
    (a) => a.status === "En sala de espera" || a.status === "Reservado",
  );
  const nextPatient =
    upcomingAppointments.length > 0
      ? upcomingAppointments[0].patient_name
      : "No hay más pacientes agendados";

  const displayedAppointments = filterStatus
    ? allAppointments.filter((a) => slugify(a.status) === filterStatus)
    : allAppointments;

  let html = `
    <div class="panel-medico">
        <h4>Control de Consultorio</h4>
        <div class="medico-row"><strong>Actual:</strong> <span>${currentPatient}</span></div>
        <div class="medico-row"><strong>Siguiente:</strong> <span>${nextPatient}</span></div>
        <div class="medico-row"><strong>En Espera:</strong> <span class="badge-espera">${waitingList.length} pacientes</span></div>
    </div>

    <h4 style="margin: 1rem 0 0.5rem 0; font-size:0.85rem; text-transform:uppercase; color:#666;">Listado de Turnos</h4>
  `;

  if (!displayedAppointments.length) {
    html += '<p class="panel-empty">Sin pacientes para este estado.</p>';
    panelBody.innerHTML = html;
    return;
  }

  // Lista de estados para el desplegable dinámico
  const statusEnum = [
    "Reservado",
    "En sala de espera",
    "En atención",
    "Finalizado",
    "Cancelado",
    "Ausente",
  ];

  html += displayedAppointments
    .map(
      (a) => `
<div class="appointment-card" data-id="${a.id}">
    <div class="appointment-card__row">
        <span class="appointment-card__time">${a.time_start.slice(0, 5)}</span>
        <span class="appointment-card__name">${a.patient_name}</span>
        <span class="appointment-card__doctor">${a.doctor || "—"}</span>
        <div class="appointment-card__status badge-">
            <select class="form-select select-flujo-cambio" id="select-flujo-${a.id}" data-id="${a.id}">
                ${statusEnum.map((status) => `<option value="${status}" ${a.status === status ? "selected" : ""}>${status}</option>`).join("")}
            </select>
        </div>
        <button class="btn-ver-detalles appointment-card__toggle" data-id="${a.id}">
            Ver detalles
        </button>
    </div>
    
    <div class="appointment-card__detail">
        <div class="detail-row"><span class="detail-label">Obra social</span><span>${a.social_work || "—"}</span></div>
        <div class="detail-row"><span class="detail-label">Notas</span><span>${a.notes || "—"}</span></div>
        
        <div class="appointment-history-log" id="histLog-${a.id}">
            <span class="detail-label">Línea de Tiempo del Paciente:</span>
            <div class="history-items">Cargando recorrido...</div>
        </div>

        <div class="detail-actions" style="margin-top:0.75rem;">
            <button class="btn btn--danger btn--sm appointment-card__delete" data-id="${a.id}">Eliminar</button>
        </div>
    </div>
</div>
  `,
    )
    .join("");

  panelBody.innerHTML = html;

  // Manejo de clics para expandir/colapsar la tarjeta y mostrar detalles
  panelBody.querySelectorAll(".appointment-card__toggle").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();

      const card = btn.closest(".appointment-card");
      const isOpen = card.classList.contains("is-open");

      panelBody
        .querySelectorAll(".appointment-card.is-open")
        .forEach((c) => c.classList.remove("is-open"));

      if (!isOpen) {
        card.classList.add("is-open");
        loadTimelineHistory(card.dataset.id);
      }
    });
  });

  // Evento para el cambio en el desplegable de estados
  panelBody.querySelectorAll(".select-flujo-cambio").forEach((select) => {
    select.addEventListener("click", (e) => {
      e.stopPropagation();
    });

    select.addEventListener("change", async () => {
      const id = select.dataset.id;
      const targetStatus = select.value;

      console.group("CAMBIO DE ESTADO");
      console.log("Turno ID:", id);
      console.log("Nuevo estado:", targetStatus);

      try {
        select.disabled = true;

        const fd = new FormData();
        fd.append("id", id);
        fd.append("status", targetStatus);

        const response = await fetch(`${BASE_URL}/?action=update_status`, {
          method: "POST",
          body: fd,
        });

        console.log("HTTP:", response.status);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        console.log("Actualización OK");

        await loadAppointments(activeDay, currentFilterStatus);
      } catch (error) {
        console.error("ERROR AL CAMBIAR ESTADO:", error);
        alert("No se pudo actualizar el estado.\n\n" + error.message);
      } finally {
        select.disabled = false;
        console.groupEnd();
      }
    });
  });

  // Evento para eliminar un turno
  panelBody.querySelectorAll(".appointment-card__delete").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteAppointment(btn.dataset.id);
    });
  });
}

// Carga el historial de auditoría del turno
async function loadTimelineHistory(id) {
  const container = document.querySelector(`#histLog-${id} .history-items`);
  if (!container) return;
  try {
    const res = await fetch(`${BASE_URL}/?action=history&id=${id}`);
    const history = await res.json();
    if (!history || !history.length) {
      container.innerHTML = `<p style="font-size:0.75rem; color:#888; margin:0;">Sin registros de flujo.</p>`;
      return;
    }
    container.innerHTML = history
      .map((h) => {
        const time = h.changed_at.slice(11, 16);
        return `<div class="hist-item">• <strong>${time} hs:</strong> ${h.status_from ? h.status_from : "Turno creado"} → <span>${h.status_to}</span></div>`;
      })
      .join("");
  } catch (err) {
    container.innerHTML = "Error al mapear línea de tiempo.";
  }
}

// Elimina un turno
async function deleteAppointment(id) {
  try {
    const fd = new FormData();
    fd.append("id", id);
    await fetch(`${BASE_URL}/?action=delete`, { method: "POST", body: fd });
    loadAppointments(activeDay, currentFilterStatus);
  } catch (err) {
    console.error(err);
  }
}

// — Modal —————————————————————————————————————————————————————————

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
  document.getElementById("appointmentStatus").value = "Reservado";
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
  fd.append("status", document.getElementById("appointmentStatus").value);
  fd.append("date", activeDay);

  if (!fd.get("patient_name") || !fd.get("time_start") || !fd.get("time_end")) {
    alert("Paciente, hora inicio y hora fin son obligatorios.");
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/?action=create`, {
      method: "POST",
      body: fd,
    });
    const data = await res.json();
    if (data.success) {
      closeModal();
      loadAppointments(activeDay, currentFilterStatus);
    } else {
      alert("Error al guardar.");
    }
  } catch (err) {
    console.error(err);
  }
});

// Formatea las cadenas de fecha
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

// Convierte texto a formato slug para filtros URL/Dataset
function slugify(text) {
  if (!text) return "";
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

// Control global de errores
window.addEventListener("error", (event) => {
  console.group("ERROR GLOBAL");
  console.error(event.message);
  console.error(event.filename);
  console.error(event.lineno);
  console.error(event.error);
  console.groupEnd();
});

window.addEventListener("unhandledrejection", (event) => {
  console.group("PROMESA RECHAZADA");
  console.error(event.reason);
  console.groupEnd();
});
