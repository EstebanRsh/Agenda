# Flujo completo de atención del paciente

## Objetivo

El objetivo de esta mejora es permitir que el sistema represente de forma precisa el recorrido administrativo de un paciente desde el momento en que solicita un turno hasta que finaliza su consulta médica.

Actualmente la agenda permite visualizar los turnos programados y su estado general. Sin embargo, no refleja qué está ocurriendo en tiempo real dentro del centro médico.

La implementación de un flujo de atención permitirá que recepcionistas y profesionales conozcan en todo momento la situación actual de cada paciente.

Esta funcionalidad transforma la agenda en una herramienta operativa capaz de gestionar el trabajo diario de recepción y consultorio.

---

## Problema que resuelve

En un centro médico no alcanza con saber que existe un turno asignado.

Durante una jornada normal pueden ocurrir distintas situaciones:

- Un paciente reservó un turno para una fecha futura.
- Un paciente llegó al establecimiento y está esperando.
- Un paciente ingresó al consultorio.
- Un paciente finalizó su consulta.
- Un paciente canceló.
- Un paciente no asistió.

Si la agenda solo almacena la fecha y hora del turno, no existe una representación clara de la situación actual del paciente.

Esto obliga a médicos y recepcionistas a comunicarse constantemente para conocer el estado real de la atención.

---

## Concepto principal

Cada turno deberá avanzar a través de distintas etapas durante su ciclo de vida.

El sistema deberá permitir modificar el estado del turno conforme avance la atención.

Flujo propuesto:

Reservado
↓
En sala de espera
↓
En atención
↓
Finalizado

Estados alternativos:

Reservado
↓
Cancelado

Reservado
↓
Ausente

---

## Estados del flujo

### Reservado

Es el estado inicial.

Se asigna automáticamente cuando se crea un turno.

Representa que el paciente tiene un horario reservado dentro de la agenda.

Características:

- Ocupa un espacio horario.
- Puede modificarse.
- Puede cancelarse.
- Todavía no llegó al establecimiento.

---

### En sala de espera

Representa que el paciente ya llegó al centro médico y se encuentra esperando ser atendido.

La recepcionista podrá cambiar manualmente el estado cuando el paciente se registre al llegar.

Características:

- El paciente está presente.
- Espera el llamado del profesional.
- Permite conocer cuántas personas se encuentran actualmente en recepción.

---

### En atención

Representa que el paciente ingresó al consultorio.

Este estado puede ser asignado por:

- La recepcionista.
- El médico.
- El propio sistema mediante una acción específica.

Características:

- El paciente ya no se encuentra en sala de espera.
- Está ocupando el consultorio.
- Permite visualizar qué paciente está siendo atendido actualmente.

---

### Finalizado

Representa que la consulta terminó correctamente.

Características:

- El turno queda cerrado.
- El horario ya fue utilizado.
- Permite generar estadísticas futuras.
- Permite mantener un historial administrativo.

---

### Cancelado

Representa que el paciente notificó que no asistirá.

Características:

- Libera el horario.
- Permite reasignar el turno.
- Queda registrado para fines administrativos.

---

### Ausente

Representa que el paciente no se presentó y tampoco canceló.

Características:

- El turno se considera perdido.
- El horario no pudo reutilizarse.
- Permite generar estadísticas de inasistencia.

---

## Cambios en la interfaz

### Agenda diaria

Cada turno deberá mostrar claramente su estado actual.

Ejemplo conceptual:

09:00 - Juan Pérez
Estado: En sala de espera

09:30 - María Gómez
Estado: En atención

10:00 - Carlos Fernández
Estado: Finalizado

El objetivo es que el usuario comprenda la situación actual sin abrir el turno.

---

### Acciones rápidas

Cada turno deberá disponer de acciones rápidas para avanzar en el flujo.

Ejemplos:

- Marcar como "En sala de espera".
- Marcar como "En atención".
- Marcar como "Finalizado".
- Marcar como "Ausente".
- Marcar como "Cancelado".

Estas acciones deben requerir la menor cantidad posible de clics.

---

## Panel operativo del día

El sistema puede incorporar un pequeño resumen operativo.

Información sugerida:

- Pacientes programados.
- Pacientes en espera.
- Pacientes en atención.
- Pacientes atendidos.
- Cancelaciones.
- Ausencias.

Este panel permite conocer el estado general de la jornada sin revisar cada turno individualmente.

---

## Vista para el médico

El profesional debería poder visualizar rápidamente:

Paciente actual.
Próximo paciente.
Pacientes esperando.

Ejemplo conceptual:

Paciente actual:
Juan Pérez

Próximo:
María Gómez

En sala de espera:
3 pacientes

Esta información mejora la organización del consultorio y reduce interrupciones con recepción.

---

## Historial del flujo

Cada cambio de estado puede quedar registrado.

Ejemplo:

14/06/2026 09:00
Turno creado.

14/06/2026 08:55
Paciente llegó a recepción.

14/06/2026 09:05
Paciente ingresó al consultorio.

14/06/2026 09:28
Consulta finalizada.

Este historial permite reconstruir el recorrido completo del paciente dentro del sistema.

---

## Beneficios para recepción

- Permite conocer quién llegó.
- Reduce consultas entre recepción y consultorio.
- Facilita la organización diaria.
- Permite detectar retrasos.
- Mejora la coordinación general.

---

## Beneficios para el médico

- Permite conocer quién está esperando.
- Permite visualizar el próximo paciente.
- Reduce interrupciones administrativas.
- Mejora la gestión del tiempo.

---

## Beneficios para el sistema

- Convierte una agenda pasiva en una herramienta operativa.
- Genera información útil para estadísticas futuras.
- Mejora la experiencia de uso.
- Aumenta el valor profesional del proyecto.

---

## Complejidad de implementación

Complejidad: baja a media.

Requiere:

1. Extender el catálogo de estados.
2. Adaptar la base de datos.
3. Incorporar controles para cambiar estados.
4. Mostrar información contextual en la agenda.
5. Agregar indicadores operativos básicos.

El impacto funcional es alto porque permite representar el funcionamiento real de un centro médico utilizando una estructura relativamente simple.
