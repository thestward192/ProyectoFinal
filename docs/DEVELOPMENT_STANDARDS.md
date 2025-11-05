# 1. Convenciones de Código y Estilo

Lenguaje principal: JavaScript (Node.js, CommonJS)

## 1.1 Nomenclatura

- Variables y funciones
  - lowerCamelCase: totalAmount, getUserById.
  - Funciones: verbo + sustantivo. Booleans con prefijos is/has/should/can.
  - Evitar abreviaturas y nombres ambiguos; usar nombres descriptivos.
  - Promesas: usar nombres que describan el resultado (user, users), no "*Promise".
- Clases y tipos documentados
  - Clases: PascalCase, p. ej., UserService, AuthController.
  - Tipos definidos con JSDoc (@typedef/@enum): PascalCase para el nombre del tipo; si simulas enums con objetos, usar UPPER_SNAKE_CASE para sus miembros.
- Constantes globales
  - UPPER_SNAKE_CASE: DEFAULT_TIMEOUT_MS, API_BASE_URL.
  - Evitar “números mágicos”: declarar constantes con nombre.
- Nombres de archivos y directorios
  - kebab-case para archivos y carpetas: user-service.js, auth-controller.test.js.
  - Un archivo por módulo principal; el nombre refleja el contenido.
  - Archivos de índice solo para reexportar o puntos de entrada explícitos (ej.: index.js, server.js).

## 1.2 Formato

- Sangría
  - 2 espacios. No usar tabulaciones.
- Longitud máxima de línea
  - 100 caracteres. Romper líneas antes si mejora la legibilidad.
- Espaciado
  - Espacios alrededor de operadores: a + b, x === y.
  - Espacio después de comas: fn(a, b).
  - Objetos y arrays: { key: value }, [1, 2, 3].
  - Funciones: espacio antes de la llave y después de paréntesis: function x(a, b) { … } / (a, b) => { … }.
- Posición de las llaves
  - Estilo K&R: llave de apertura en la misma línea para bloques, clases y funciones.
  - Siempre usar llaves en bloques de control, incluso para una sola instrucción.
- Punto y coma y comillas
  - Usar punto y coma al final de cada sentencia.
  - Preferir comillas simples para strings ('…'); usar template literals (`` `…${x}` ``) para interpolación.

## 1.3 Estructura

- Orden de imports/requires
  1) Módulos nativos de Node (fs, path).
  2) Dependencias externas (npm).
  3) Alias del proyecto (si existen).
  4) Rutas relativas internas (primero “./…”, luego “../…”).
  - Separar grupos con una línea en blanco.
  - Orden alfabético dentro de cada grupo.
  - CommonJS: preferir un require por módulo y destructuring cuando aplique: const { Router } = require('express').
- Comentarios obligatorios
  - Usar JSDoc en:
    - Clases públicas y módulos exportados.
    - Funciones y métodos exportados o usados como handlers de rutas/middleware.
  - Incluir como mínimo:
    - Descripción breve de propósito y efectos laterales.
    - @param para cada parámetro con tipo y significado.
    - @returns con la descripción del valor devuelto (o @returns {void}).
    - @throws para errores esperados.
    - Ejemplo breve cuando sea útil.





## 2. Prácticas de Calidad Obligatorias

- Linting
  - Es obligatorio ejecutar el linter antes de commitear o abrir un PR.
  - Herramienta: ESLint con reglas alineadas a estas normas (2 espacios, 100 columnas, llaves obligatorias, comillas simples y punto y coma).
  - Comando: `npm run lint`.

- Build/Compilación
  - Este proyecto no requiere transpilación; la verificación de “build” asegura que el código pasa las validaciones estáticas.
  - La build debe pasar localmente y en CI sin errores ni warnings críticos.
  - Comando: `npm run build` (ejecuta linting como verificación mínima de integridad).

- BDD (Behavior-Driven Development)
  - Se usa Cucumber.js para describir el comportamiento desde la perspectiva del usuario.
  - Estructura:
    - `features/*.feature` para especificaciones en Gherkin.
    - `features/steps/*.steps.js` para definiciones de pasos.
  - Las historias deben cubrir el flujo “happy path” y al menos 1 caso de borde relevante.
  - Comando: `npm run test:bdd` (también disponible como `npm test`).





# 3. Reglas Específicas para Agentes de IA

Estas pautas aplican si se integra un agente/servicio de IA (por ejemplo, consumo de LLM vía API) dentro de este proyecto Node.js (Express + OIDC). Priorizar seguridad, privacidad y control de salidas.

## 3.1 Datos y Privacidad

- Minimización de datos: enviar al proveedor de IA solo lo estrictamente necesario. Nunca incluir tokens de sesión (`req.appSession`, `req.oidc.idToken`, `access_token`) ni identificadores sensibles.
- PII y secretos: redactar/anonimizar emails, nombres, IDs y secretos antes de construir prompts o logs.
- Retención: no persistir conversaciones con PII salvo requerimiento explícito y con tiempo de retención definido; si se guardan, cifrar en reposo.
- Consentimiento y base legal: documentar para qué se usan los datos y cómo se almacenan/anonymizan.

## 3.2 Seguridad de Prompts y Contexto

- Prompt injection: usar un system prompt claro con políticas inapelables (qué puede y no puede hacer), y filtrar/neutralizar instrucciones del usuario que pidan exfiltrar datos o saltarse controles.
- Contexto controlado: si se hace retrieval (RAG), curar y sanear fuentes; no aceptar URLs arbitrarias del usuario sin validación/allowlist.
- No ejecución dinámica: nunca ejecutar código devuelto por el modelo (eval, Function, child_process) ni comandos shell generados por el modelo sin una revisión y confirmación explícita.

## 3.3 Gestión de Secretos y Accesos

- Configuración solo por variables de entorno: `AI_PROVIDER`, `AI_API_KEY`, etc. No hardcodear credenciales en código ni vistas.
- Scope por usuario: si se personaliza el contexto, derivarlo del usuario autenticado (`requiresAuth()`), pero sin exponer claims completos al modelo; incluir solo atributos necesarios y, si es posible, pseudonimizados.
- No registrar secretos: nunca loggear API keys, tokens o prompts con datos sensibles. Enmascarar logs.

## 3.4 Integraciones, Red y Límite de Daño

- Egress controlado: definir allowlist de dominios de salida para llamadas de IA.
- Rate limiting y cuotas: aplicar rate-limit por IP/usuario a los endpoints de IA para evitar abuso y costos inesperados.
- Timeouts y reintentos: configurar timeouts razonables y reintentos con backoff; no bloquear el hilo de evento.
- Validación de salidas: validar y sanear la respuesta del modelo (JSON schema si aplica) antes de usarla o mostrarla.

## 3.5 Registro, Monitoreo y Alertas

- Trazabilidad: registrar métricas (latencia, tamaño de prompt/respuesta, tasa de error) sin PII.
- Alertas: umbrales por error rate/timeout/spike de costos. Revisiones periódicas.
- Redacción de logs: aplicar máscaras a emails y tokens en cualquier log de middleware o de agentes.

## 3.6 Evaluación y Pruebas

- BDD para agentes: describir comportamientos esperados y límites de seguridad en `.feature` (ej.: “el agente no debe revelar secretos”, “redacta emails”).
- Pruebas de inyección: incluir escenarios con intentos de prompt injection/exfiltración y verificar mitigaciones.
- Test contractuales: si la salida debe ser JSON, validar contra un esquema.

## 3.7 Despliegue y Dependencias

- Versionado de modelos: fijar versiones o familias de modelos; no degradar automáticamente a modelos menos seguros en producción.
- Dependencias minimalistas: evitar SDKs innecesarios; revisar licencias y vulnerabilidades (npm audit) antes de actualizar.
- Separación lógica: encapsular la integración de IA en `services/ai/` y exponer una interfaz sencilla (contrato) al resto de la app.

## 3.8 Cumplimiento y Contenido

- Políticas de uso: bloquear usos no permitidos (contenido ilegal, sensible, datos de menores). Documentar categorías prohibidas y mensajes de error consistentes.
- Localización de datos: si aplica, seleccionar regiones del proveedor; documentar el flujo de datos transfronterizo.

## 3.9 Respuesta a Incidentes

- Playbook: definir qué hacer ante fuga de datos, abuso de API o respuestas peligrosas (desactivar endpoints, rotar keys, notificar).
- Observabilidad: conservar evidencias no sensibles para análisis post mortem.

## 3.10 Contrato mínimo de un agente (ejemplo)

- Entrada: `{ userId, intent, inputText, contextSanitized }`.
- Salida: `{ success: boolean, content: string | object, redactions: string[], warnings: string[] }`.
- Errores: timeouts, validación, proveedor no disponible; nunca incluir datos sensibles en mensajes de error.
- Criterio de éxito: respuesta conforme a política, sin PII no autorizada, dentro de límites de longitud/tiempo.

## 3.11 Aplicación práctica en este proyecto

- Autenticación existente: usar `requiresAuth()` para asociar cada solicitud de IA a un usuario autenticado; no pasar tokens ni claims completos al modelo.
- Ubicación sugerida: crear `services/ai/client.js` para el cliente del proveedor y `routes/ai.js` para endpoints, con validaciones y rate-limit.
- Variables de entorno: declarar `AI_PROVIDER`, `AI_API_KEY`, `AI_BASE_URL`, `AI_TIMEOUT_MS`. No incluirlas en el repositorio.
- BDD: añadir `features/ai-security.feature` con escenarios de no-exfiltración y redacción de PII.