// Renderizado y control del Panel Lateral (Vista)
import {
  fetchAppointments,
  updateAppointmentStatus,
  fetchTimelineHistory,
  removeAppointment,
} from "./api.js";
import { formatDate, slugify } from "./utils.js";
import { appState } from "./main.js";

const panel = document.getElementById("dayPanel");
const panelDate = document.getElementById("panelDate");
const panelBody = document.getElementById("panelBody");
const layout = document.querySelector(".app-layout");

// Variables internas de control para persistir los filtros en la sesión de la vista
let appointmentSearchQuery = "";
let appointmentFilterStatus = "todos";

export function openPanelForDate(cell, date, statusFilter) {
  document
    .querySelectorAll(".calendar__cell--selected")
    .forEach((c) => c.classList.remove("calendar__cell--selected"));
  cell.classList.add("calendar__cell--selected");

  appState.activeDay = date;

  // Sincronizar el filtro si se hace click directo desde un badge del calendario
  appointmentFilterStatus = statusFilter ? slugify(statusFilter) : "todos";
  appointmentSearchQuery = "";

  const dateFormatted = formatDate(date);
  panelDate.innerHTML = dateFormatted;

  panel.classList.add("is-open");
  layout.classList.add("panel-open");
  loadAppointments(date);
}

export function closePanel() {
  panel.classList.remove("is-open");
  layout.classList.remove("panel-open");
  document
    .querySelectorAll(".calendar__cell--selected")
    .forEach((c) => c.classList.remove("calendar__cell--selected"));
  appState.activeDay = null;
}

// Llama al servidor enviando los filtros actuales
export async function loadAppointments(date) {
  if (!date) return;

  try {
    // PHP realiza la búsqueda y filtrado de manera segura en el servidor
    const appointments = await fetchAppointments(
      date,
      appointmentSearchQuery,
      appointmentFilterStatus,
    );
    renderAppointmentsList(appointments);
  } catch (error) {
    console.error(error);
    panelBody.innerHTML = `<p class="panel-loading">Error al cargar turnos.</p>`;
  }
}

function renderAppointmentsList(appointments) {
  // 1. Inyectamos los filtros con el contenedor deslizable horizontal nativo
  let html = `
    <div class="panel-controls" style="margin-bottom: 1rem; display: flex; flex-direction: column; gap: 0.5rem;">
      <input type="text" id="appointmentSearch" placeholder="Buscar paciente o profesional..." value="${appointmentSearchQuery}" 
        style="width: 100%; padding: 0.45rem 0.75rem; font-size: 0.85rem; border: 1px solid var(--color-border); border-radius: var(--radius); font-family: var(--font); outline: none;"
      />
      <div class="panel-filters" style="display: flex; gap: 0.35rem; overflow-x: auto; padding-bottom: 6px; scrollbar-width: none; -ms-overflow-style: none;">
        <button class="btn-filter ${appointmentFilterStatus === "todos" ? "active" : ""}" data-status="todos">Todos</button>
        <button class="btn-filter ${appointmentFilterStatus === "reservado" ? "active" : ""}" data-status="reservado">Reservados</button>
        <button class="btn-filter ${appointmentFilterStatus === "en-sala-de-espera" ? "active" : ""}" data-status="en-sala-de-espera">En Espera</button>
        <button class="btn-filter ${appointmentFilterStatus === "en-atencion" ? "active" : ""}" data-status="en-atencion">En Atención</button>
        <button class="btn-filter ${appointmentFilterStatus === "finalizado" ? "active" : ""}" data-status="finalizado">Finalizados</button>
        <button class="btn-filter ${appointmentFilterStatus === "ausente" ? "active" : ""}" data-status="ausente">Ausentes</button>
        <button class="btn-filter ${appointmentFilterStatus === "cancelado" ? "active" : ""}" data-status="cancelado">Cancelados</button>
      </div>
    </div>
    <div id="appointmentsListContainer">
  `;

  if (!appointments || !appointments.length) {
    html += `<p class="panel-empty">No se encontraron turnos con los filtros aplicados.</p></div>`;
    panelBody.innerHTML = html;
    setupFilterListeners();
    return;
  }

  // 2. Renderizado de las nuevas tarjetas optimizadas para lectura rápida
  appointments.forEach((a) => {
    const sluggedStatus = slugify(a.status);
    html += `
      <div class="appointment-card" data-id="${a.id}">
        <div class="appointment-card__row">
          <div class="appointment-card__col-left">
            <span class="appointment-card__time">${a.time_start.substring(0, 5)}</span>
            <span class="appointment-card__name">${a.patient_name}</span>
          </div>
          <div class="appointment-card__col-right">
            <span class="appointment-card__doctor">${a.doctor || "Sin asignar"}</span>
            <span class="status-badge status-badge--${sluggedStatus}">${a.status}</span>
          </div>
        </div>
        
        <div class="appointment-card__detail">
          <!-- Cabecera exclusiva para el Modal/Bottom Sheet en móvil -->
          <div class="detail-header-mobile">
            <h3>Gestión del Turno</h3>
            <span class="detail-close-mobile" aria-label="Cerrar modal">&times;</span>
          </div>
          
          <div class="detail-grid">
            <div class="detail-row">
              <span class="detail-label">Cambiar Estado Clínico:</span>
              <select class="form-select select-flujo-cambio select-flujo-cambio--${sluggedStatus}" data-id="${a.id}">
                <option value="Reservado" ${a.status === "Reservado" ? "selected" : ""}>Reservado</option>
                <option value="En sala de espera" ${a.status === "En sala de espera" ? "selected" : ""}>En sala de espera</option>
                <option value="En atención" ${a.status === "En atención" ? "selected" : ""}>En atención</option>
                <option value="Finalizado" ${a.status === "Finalizado" ? "selected" : ""}>Finalizado</option>
                <option value="Ausente" ${a.status === "Ausente" ? "selected" : ""}>Ausente</option>
                <option value="Cancelado" ${a.status === "Cancelado" ? "selected" : ""}>Cancelado</option>
              </select>
            </div>
            <div class="detail-row"><span class="detail-label">Teléfono:</span> <span>${a.phone || "No registrado"}</span></div>
            <div class="detail-row"><span class="detail-label">Obra Social:</span> <span>${a.social_work || "Particular"}</span></div>
            <div class="detail-row"><span class="detail-label">Monto ($):</span> <span>${a.payment || "0"}</span></div>
            <div class="detail-row"><span class="detail-label">Notas:</span> <span>${a.notes || "Sin observaciones"}</span></div>
          </div>
          
          <div class="appointment-history-log" id="histLog-${a.id}">
            <div class="history-items">
              <p style="font-size:0.75rem; color:#888; margin:0;">Cargando historial de flujo...</p>
            </div>
          </div>

          <div class="detail-actions">
            <button class="btn btn--danger btn--sm appointment-card__delete" data-id="${a.id}">Eliminar Turno</button>
          </div>
        </div>
      </div>
    `;
  });

  html += `</div>`;
  panelBody.innerHTML = html;

  setupFilterListeners();
  attachAppointmentEvents();
}

function setupFilterListeners() {
  const searchInput = document.getElementById("appointmentSearch");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      appointmentSearchQuery = e.target.value;
      loadAppointments(appState.activeDay);

      const input = document.getElementById("appointmentSearch");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  }

  document.querySelectorAll(".btn-filter").forEach((btn) => {
    btn.addEventListener("click", () => {
      appointmentFilterStatus = btn.dataset.status;
      loadAppointments(appState.activeDay);
    });
  });
}

function attachAppointmentEvents() {
  // Ahora toda la fila (tarjeta) abre de forma interactiva el detalle/modal
  panelBody.querySelectorAll(".appointment-card__row").forEach((row) => {
    row.addEventListener("click", (e) => {
      const card = row.closest(".appointment-card");
      const isOpen = card.classList.contains("is-open");

      panelBody
        .querySelectorAll(".appointment-card")
        .forEach((c) => c.classList.remove("is-open"));

      if (!isOpen) {
        card.classList.add("is-open");
        loadTimelineHistory(card.dataset.id);
      }
    });
  });

  // Listener para cerrar el Bottom Sheet desde la 'X' en móvil
  panelBody.querySelectorAll(".detail-close-mobile").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const card = btn.closest(".appointment-card");
      card.classList.remove("is-open");
    });
  });

  panelBody.querySelectorAll(".select-flujo-cambio").forEach((select) => {
    select.addEventListener("change", async (e) => {
      e.stopPropagation(); // Evita re-aperturas del contenedor
      const id = select.dataset.id;
      const targetStatus = select.value;

      select.disabled = true;
      try {
        await updateAppointmentStatus(id, targetStatus);
        await loadAppointments(appState.activeDay);
      } catch (error) {
        alert("No se pudo actualizar el estado.\n\n" + error.message);
      } finally {
        select.disabled = false;
      }
    });
  });

  panelBody.querySelectorAll(".appointment-card__delete").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const card = btn.closest(".appointment-card");
      const patientName = card.querySelector(
        ".appointment-card__name",
      ).textContent;

      if (
        confirm(
          `¿Estás seguro de que deseas eliminar permanentemente el turno de ${patientName}?`,
        )
      ) {
        await removeAppointment(btn.dataset.id);
        loadAppointments(appState.activeDay);
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
        return `<div class="hist-item shadow-text">• <strong>${time} hs:</strong> ${h.status_from ? h.status_from : "Turno creado"} → <span>${h.status_to}</span></div>`;
      })
      .join("");
  } catch (err) {
    container.innerHTML = `<p style="font-size:0.75rem; color:#dc2626; margin:0;">Error al cargar línea de tiempo.</p>`;
  }
}
