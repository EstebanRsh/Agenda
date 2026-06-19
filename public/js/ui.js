// Renderizado y control del Panel Lateral (Vista)
import {
  fetchAppointments,
  updateAppointmentStatus,
  fetchTimelineHistory,
  removeAppointment,
} from "./api.js";
import { formatDate, slugify } from "./utils.js";
import { appState } from "./main.js"; // Importamos el estado global compartido

const panel = document.getElementById("dayPanel");
const panelDate = document.getElementById("panelDate");
const panelBody = document.getElementById("panelBody");
const layout = document.querySelector(".app-layout");

export function openPanelForDate(cell, date, statusFilter) {
  document
    .querySelectorAll(".calendar__cell--selected")
    .forEach((c) => c.classList.remove("calendar__cell--selected"));
  cell.classList.add("calendar__cell--selected");

  appState.activeDay = date;
  appState.currentFilterStatus = statusFilter;

  const dateFormatted = formatDate(date);
  panelDate.innerHTML = statusFilter
    ? `${dateFormatted} <span style="font-size:0.8rem; font-weight:normal; display:block; color:#666;">Filtrado: ${statusFilter.replace("-", " ")}</span>`
    : dateFormatted;

  panel.classList.add("is-open");
  layout.classList.add("panel-open");
  loadAppointments(date, statusFilter);
}

export function closePanel() {
  panel.classList.remove("is-open");
  layout.classList.remove("panel-open");
  document
    .querySelectorAll(".calendar__cell--selected")
    .forEach((c) => c.classList.remove("calendar__cell--selected"));
  appState.activeDay = null;
  appState.currentFilterStatus = null;
}

export async function loadAppointments(date, filterStatus = null) {
  panelBody.innerHTML =
    '<p class="panel-loading">Cargando tablero operativo...</p>';
  try {
    const data = await fetchAppointments(date);
    renderDashboardAndAppointments(data, filterStatus);
  } catch (err) {
    panelBody.innerHTML =
      '<p class="panel-empty">Error al cargar datos de la jornada.</p>';
    console.error(err);
  }
}

function renderDashboardAndAppointments(allAppointments, filterStatus) {
  const waitingList = allAppointments.filter(
    (a) => a.status === "En sala de espera",
  );
  const inProgressList = allAppointments.filter(
    (a) => a.status === "En atención",
  );

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

  let html = ``;

  if (!displayedAppointments.length) {
    html += '<p class="panel-empty">Sin pacientes para este estado.</p>';
    panelBody.innerHTML = html;
    return;
  }

  const statusEnum = [
    "Reservado",
    "En sala de espera",
    "En atención",
    "Finalizado",
    "Cancelado",
    "Ausente",
  ];

  // Ordenar turnos: Primero por hora, luego por prioridad de estado clínico
  const sortedAppointments = [...displayedAppointments].sort((a, b) => {
    if (a.time_start !== b.time_start) {
      return a.time_start.localeCompare(b.time_start);
    }
    // Si coinciden en la hora (sobreturno), mandamos los cancelados/ausentes al final
    const priority = {
      "En atención": 1,
      "En sala de espera": 2,
      Reservado: 3,
      Finalizado: 4,
      Ausente: 5,
      Cancelado: 6,
    };
    return (priority[a.status] || 99) - (priority[b.status] || 99);
  });

  html += displayedAppointments
    .map(
      (a) => `
    <div class="appointment-card" data-id="${a.id}">
        <div class="appointment-card__row">
            <span class="appointment-card__time">${a.time_start.slice(0, 5)}</span>
            <span class="appointment-card__name">${a.patient_name}</span>
            <span class="appointment-card__doctor">${a.doctor || "—"}</span>
            <div class="appointment-card__status badge-">
                <select class="form-select select-flujo-cambio select-flujo-cambio--${slugify(a.status)}" id="select-flujo-${a.id}" data-id="${a.id}">
                    ${statusEnum.map((status) => `<option value="${status}" ${a.status === status ? "selected" : ""}>${status}</option>`).join("")}
                </select>
            </div>
            <button class="btn-ver-detalles appointment-card__toggle" data-id="${a.id}">Ver detalles</button>
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
  attachAppointmentEvents();
}

function attachAppointmentEvents() {
  // Despliegue de tarjetas (Ver detalles)
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

  // Evento de cambio de select de estados
  panelBody.querySelectorAll(".select-flujo-cambio").forEach((select) => {
    select.addEventListener("click", (e) => e.stopPropagation());
    select.addEventListener("change", async () => {
      try {
        select.disabled = true;
        await updateAppointmentStatus(select.dataset.id, select.value);
        await loadAppointments(
          appState.activeDay,
          appState.currentFilterStatus,
        );
      } catch (error) {
        alert("No se pudo actualizar el estado.\n\n" + error.message);
      } finally {
        select.disabled = false;
      }
    });
  });

  // Eliminar turno
  panelBody.querySelectorAll(".appointment-card__delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();

      // Alerta de confirmación
      const patientName = btn
        .closest(".appointment-card")
        .querySelector(".appointment-card__name").textContent;
      if (
        confirm(
          `¿Estás seguro de que deseas eliminar permanentemente el turno de ${patientName}?`,
        )
      ) {
        await removeAppointment(btn.dataset.id);
        loadAppointments(appState.activeDay, appState.currentFilterStatus);
      }
    });
  });
}

async function loadTimelineHistory(id) {
  const container = document.querySelector(`#histLog-${id} .history-items`);
  if (!container) return;
  try {
    const history = await fetchTimelineHistory(id);
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
