# Mejoras de Lógica de Interacción y Experiencia Visual en la Agenda

## Objetivo

El objetivo de esta mejora es llevar el sistema de estados actual hacia una interfaz más dinámica, inteligente e interactiva. Se busca optimizar el flujo de trabajo diario de médicos y recepcionistas mediante la incorporación de respuestas en tiempo real, accesos directos por estados, ordenamiento lógico estructural y consistencia en el volumen de datos mostrados en la vista mensual.

---

## Problema que resuelve

A pesar de contar con indicadores visuales en las celdas, la experiencia de usuario actual presenta las siguientes limitaciones de usabilidad:

- **Falta de granularidad al abrir celdas:** Al interactuar con un día que contiene múltiples turnos, el panel lateral muestra toda la lista mezclada, obligando al usuario a filtrar visualmente o hacer scroll si la jornada es extensa.
- **Opacidad informativa pre-clic:** El usuario debe abrir obligatoriamente el panel lateral para conocer qué pacientes específicos corresponden a los estados reflejados en el mes.
- **Desconexión en las acciones:** Al modificar el estado de un turno dentro del panel de detalles, la vista de fondo del calendario mensual carece de una respuesta animada que confirme visualmente el impacto inmediato de la acción.
- **Lectura mensual desorganizada:** Los círculos de estado varían su posición interna de un día a otro según el orden de inserción de los datos, dificultando la búsqueda sistemática por memoria espacial.
- **Saturación por turnos inactivos:** El conteo mensual registra los turnos cancelados de la misma forma que los activos, transmitiendo una falsa percepción de alta ocupación en días con muchas bajas.

---

## Solución propuesta

Implementar una capa superior de lógica de interacción y control de datos dividida en cuatro pilares de comportamiento:

1. Filtrado dinámico por interacción directa en los círculos de la celda.
2. Globos de información contextual instantánea al pasar el cursor (Tooltips).
3. Transiciones visuales dinámicas para la actualización de estados.
4. Organización estructural y filtrado de datos desde el motor de consultas.

---

## Comportamiento dentro de la agenda

### Filtrado dinámico desde el calendario mensual

Cuando el usuario interactúe con el calendario mensual, el sistema distinguirá el punto exacto de presión:

- **Clic general en la celda:** El panel lateral derecho se abrirá mostrando de forma habitual la totalidad de los turnos programados para esa jornada.
- **Clic específico en un círculo de estado:** El panel lateral derecho se abrirá con un filtro automático e inmediato ya aplicado. La interfaz ocultará el resto de las categorías y mostrará únicamente los turnos que pertenezcan a la condición seleccionada, reduciendo drásticamente la carga cognitiva y el tiempo de lectura.

---

### Globos informativos contextuales (Tooltips) al pasar el cursor

Para agilizar la lectura de la agenda de escritorio sin necesidad de realizar clics o cambiar de contexto:

- Al posicionar el cursor del mouse sobre cualquier círculo numérico de estado en el mes, emergerá un sutil globo flotante de diseño minimalista.
- Este globo procesará e indicará de forma textual y compacta qué pacientes específicos se encuentran bajo esa condición el día seleccionado, permitiendo una previsualización instantánea de la actividad del consultorio.

---

## Comportamiento durante el flujo de trabajo

### Animaciones de transición para cambios de estado en tiempo real

Durante el flujo de edición en el panel lateral, el sistema mantendrá una sincronización interactiva y fluida con la vista general:

- En el instante en que el recepcionista o médico guarde un cambio de estado para un paciente (por ejemplo, pasando de "Pendiente" a "En atención"), la celda de fondo del calendario mensual procesará la actualización de manera dinámica.
- Los círculos numéricos involucrados experimentarán una breve transición física (como una pequeña escala de pulsación o un sutil destello visual) para confirmar la adición, resta o aparición del nuevo estado, otorgando feedback visual inmediato sin requerir recargas de página.

---

### Ordenamiento estructural fijo de los indicadores por prioridad

Para estandarizar la lectura visual a lo largo de todo el mes, los círculos numéricos mantendrán una posición inalterable dentro de su contenedor:

- El orden de aparición de los indicadores no dependerá de la secuencia de creación del turno ni del orden alfabético.
- Se establecerá una jerarquía fija basada en la prioridad operativa de la jornada. El sistema imprimirá siempre en primer lugar los estados activos y críticos (como "En atención" y "Confirmado"), seguidos por las gestiones intermedias ("Pendiente") y desplazando hacia las últimas posiciones del bloque los estados históricos o pasivos ("Finalizado", "Ausente").

---

### Exclusión de estados inactivos en el volumen mensual

Para garantizar que la densidad visual del calendario refleje con precisión el esfuerzo de atención real:

- Los turnos que transicionen al estado de "Cancelado" serán omitidos de la lógica de conteo que alimenta los círculos numéricos de las celdas mensuales.
- Al liberar ese espacio horario, el indicador se reducirá o desaparecerá del mes, asegurando que los recepcionistas no perciban un día como ocupado o bloqueado cuando en realidad dispone de disponibilidad física real debido a las cancelaciones.

---

## Beneficios para recepción

- **Navegación quirúrgica:** Permite saltar directamente a listas específicas de pacientes confirmados o en espera con un solo toque desde el mes.
- **Agilidad informativa:** Facilita conocer qué personas integran un estado de un vistazo rápido con el puntero del mouse, ideal durante llamadas telefónicas.
- **Claridad de espacios libres:** Al no contabilizar las cancelaciones en los círculos mensuales, se identifican de manera inmediata los días reales con huecos disponibles para reasignación.
- **Automatización de búsqueda:** La posición fija de cada círculo crea una rutina visual que permite saber qué estado falta o está activo mediante memoria espacial, sin necesidad de leer etiquetas.

---

## Beneficios para el médico

- **Seguimiento del flujo de sala:** Permite monitorear desde la vista mensual el progreso de su jornada de forma dinámica a medida que los círculos cambian de color y reaccionan a las transiciones del panel.
- **Enfoque inmediato:** Al abrir el panel con filtros automáticos, visualiza al instante solo los pacientes que están listos en sala de espera o bajo atención, aislando el historial administrativo del día.

---

## Complejidad de implementación

Requiere:

1. Interceptar el evento de selección en los badges individuales deteniendo la propagación hacia el contenedor mayor.
2. Modificar la rutina de renderizado de la lista del panel lateral para admitir un parámetro de filtrado por estado.
3. Incorporar eventos de escucha para el ingreso y egreso del cursor del mouse que controlen la visibilidad de los globos informativos.
4. Ajustar la consulta de obtención mensual de turnos para omitir los registros inactivos y definir una secuencia lógica fija mediante prioridades del motor de base de datos.
