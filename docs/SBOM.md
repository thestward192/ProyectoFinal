# SBOM de la Aplicación

Inventario mínimo de componentes y matriz de riesgos para este proyecto (Node.js / Express, CommonJS).

Fecha: 2025-10-29

## 1) Inventario (SBOM mínimo)

Listado basado en dependencias instaladas (npm ls --depth=0) y metadatos públicos (npm view).

| Paquete                     | Versión instalada | Licencia   | Última versión | Última modificación | Mantenedores aprox. |
|----------------------------|-------------------|------------|----------------|---------------------|---------------------|
| @okta/oidc-middleware      | 0.0.6             | Apache-2.0 | 5.5.0          | 2025-01-27          | 1                   |
| express                    | 4.18.2            | MIT        | 5.1.0          | 2025-10-15          | 4                   |
| express-openid-connect     | 2.16.0            | MIT        | 2.19.2         | 2025-10-23          | 30+                 |
| express-session            | 1.15.6            | MIT        | 1.18.2         | 2025-07-17          | 2                   |
| socket.io                  | 1.7.4             | MIT        | 4.8.1          | 2025-05-08          | 2                   |
| swig                       | 1.4.2             | MIT        | 1.4.2          | 2022-06-27          | 1                   |
| consolidate                | 0.15.1            | MIT        | 1.0.4          | 2024-10-22          | 4                   |

Notas:
- Las cifras de mantenedores y fechas reflejan la información del registry al momento de esta captura.
- La versión "Última versión" no implica compatibilidad inmediata; requiere pruebas/ajustes.

## 2) Matriz de Riesgos (Probabilidad × Impacto)

Criterios:
- Probabilidad (P) 1-5: mayor si hay versiones muy antiguas, mantenimiento bajo o vulnerabilidades conocidas.
- Impacto (I) 1-5: mayor si el paquete es crítico (auth, sesión, servidor HTTP, render) o corre en producción.
- Puntaje = P × I. Umbral sugerido para acción: ≥ 8.

| Paquete                 | Uso/rol en app                        | P | I | Puntaje | Justificación resumida | Decisión | Acción propuesta |
|-------------------------|----------------------------------------|---|---|---------|------------------------|----------|------------------|
| @okta/oidc-middleware   | Middleware OIDC (auth)                 | 4 | 5 | 20      | Instalado 0.0.6, muy por detrás de 5.x; camino crítico de autenticación. | Mitigar | Migrar a versión mantenida o reemplazar por `express-openid-connect` únicamente. |
| express                 | Framework HTTP                         | 2 | 5 | 10      | 4.18.x estable; existe 5.x; mantenimiento activo. | Mitigar | Mantener actualizado; evaluar migración a 5.x con pruebas. |
| express-openid-connect  | Autenticación OIDC                     | 2 | 5 | 10      | Versión reciente; mantenimiento activo. | Aceptar | Mantener al día; revisar deprecaciones. |
| express-session         | Sesiones de servidor                   | 4 | 5 | 20      | Instalado 1.15.6 vs 1.18.2; afecta seguridad de sesión. | Mitigar | Actualizar a 1.18.x y revisar configuración de cookies/secret. |
| socket.io               | Tiempo real (websockets)               | 5 | 4 | 20      | 1.7.4 (muy antiguo) vs 4.8.x; posibles vulnerabilidades/transitivos. | Evitar | Actualizar a 4.x o retirar si no se usa. |
| swig                    | Motor de plantillas                    | 4 | 3 | 12      | Proyecto sin mantenimiento activo; riesgo de inyección si mal uso. | Mitigar | Considerar reemplazo (por ej. Nunjucks/EJS) o aislar; endurecer escapes. |
| consolidate             | Abstracción de motores de plantillas   | 3 | 2 | 6       | Existe versión 1.0.4; rol no crítico directo. | Aceptar | Actualizar cuando sea seguro; revisar compatibilidad con el motor elegido. |

Observaciones clave:
- Varias dependencias críticas están desactualizadas (auth, sesión, tiempo real, templates). Priorizar su actualización o reemplazo.
- Si `socket.io` no se usa, retirarlo reduce superficie de ataque y deuda técnica.
- Mantener `express-openid-connect` como única integración OIDC podría simplificar y reducir riesgo.

## 3) Umbral y plan
- Umbral sugerido: puntaje ≥ 8 requiere acción.
- Propuestas de alto impacto inmediato: actualizar `express-session`, decidir estrategia de OIDC (consolidar en `express-openid-connect`), y tratar `socket.io` (actualizar/retirar).
