# Estados visuales de los turnos

## Objetivo

El objetivo de esta mejora es permitir que médicos y recepcionistas identifiquen rápidamente la situación actual de cada turno sin necesidad de abrirlo o revisar sus detalles.

Actualmente todos los turnos son visualmente iguales. Esto obliga al usuario a ingresar a cada registro para conocer su estado. A medida que aumenta la cantidad de pacientes, esta forma de trabajo se vuelve lenta y poco práctica.

La propuesta consiste en incorporar un sistema de estados para cada turno y representarlos visualmente mediante colores, etiquetas o indicadores gráficos consistentes en toda la aplicación.

---

## Problema que resuelve

En una jornada normal pueden existir turnos:

- Confirmados por el paciente.
- Pendientes de confirmación.
- Cancelados.
- Finalizados.
- Pacientes que no asistieron.
- Pacientes que están siendo atendidos en ese momento.

Si todos los turnos se muestran de la misma manera, la agenda deja de transmitir información útil a simple vista.

El usuario debe invertir tiempo en revisar cada registro individualmente para comprender la situación real del día.

---

## Solución propuesta

Agregar un campo llamado "estado" en la tabla de turnos.

Por ejemplo:

- Pendiente
- Confirmado
- En atención
- Finalizado
- Cancelado
- Ausente

Cada turno deberá tener uno de estos estados en todo momento.

---

## Comportamiento dentro de la agenda

Cuando un turno se visualiza en la agenda diaria o mensual, el sistema deberá mostrar una representación visual asociada a su estado.

Ejemplos:

- Confirmado: color verde.
- Pendiente: color amarillo.
- En atención: color azul.
- Finalizado: color gris.
- Cancelado: color rojo.
- Ausente: color naranja.

El usuario podrá identificar la situación de cada turno sin necesidad de abrirlo.

---

## Comportamiento durante el flujo de trabajo

### Creación del turno

Al crear un turno, el estado inicial será:

"Pendiente"

Esto indica que el paciente todavía no confirmó la asistencia fisica. pero reservo su lugar en la agenda

---

### Confirmación o en espera del turno

Cuando el paciente o este confirme su asistencia física en la sala de espera, el estado cambiará a:

"Confirmado o esperando en sala de espera"

---

### Inicio de la consulta

Cuando el paciente ingrese al consultorio, el estado cambiará a:

"En atención"

Esto permite que recepción sepa qué paciente está siendo atendido.

---

### Finalización de la consulta

Al terminar la atención médica, el estado cambiará a:

"Finalizado"

Esto permite generar estadísticas futuras y mantener un historial correcto.

---

### Cancelación

Si el paciente avisa que no asistirá, el estado cambiará a:

"Cancelado"

El horario quedará nuevamente disponible para asignar otro turno.

---

### Ausencia

Si el paciente no se presenta y no informa la cancelación, el estado cambiará a:

"Ausente"

Este dato puede utilizarse posteriormente para generar reportes sobre inasistencias.

---

## Beneficios para recepción

- Permite identificar rápidamente qué pacientes asistirán.
- Facilita detectar cancelaciones.
- Ayuda a reorganizar horarios disponibles.
- Reduce el tiempo dedicado a revisar información individual.

---

## Beneficios para el médico

- Permite conocer el estado de la agenda antes de comenzar la jornada.
- Facilita visualizar pacientes pendientes y atendidos.
- Mejora el seguimiento diario de consultas.

##

---

## Complejidad de implementación

La complejidad técnica es baja.

Solo requiere:

1. Agregar un campo "estado" en la base de datos.
2. Modificar el formulario de edición de turnos.
3. Mostrar una representación visual del estado en la agenda.
4. Permitir cambios de estado durante el flujo de atención.

El impacto visual y funcional es alto en comparación con el esfuerzo de desarrollo requerido.
