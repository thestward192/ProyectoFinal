# Matriz de Riesgos de Dependencias

Fecha: 2025-10-29

Criterios: Probabilidad (P) 1-5, Impacto (I) 1-5, Puntaje = P × I. Umbral de acción: ≥ 8.

| Paquete                 | Versión | Licencia | Mantenimiento (últ. mod) | Uso/rol | P | I | Puntaje | Decisión | Acción |
|-------------------------|---------|----------|---------------------------|---------|---|---|---------|----------|--------|
| @okta/oidc-middleware   | 0.0.6   | Apache-2.0 | 2025-01-27              | OIDC    | 4 | 5 | 20      | Mitigar  | Migrar a versión mantenida o consolidar en `express-openid-connect`. |
| express                 | 4.18.2  | MIT      | 2025-10-15                | HTTP    | 2 | 5 | 10      | Mitigar  | Mantener al día; evaluar Express 5.x. |
| express-openid-connect  | 2.16.0  | MIT      | 2025-10-23                | OIDC    | 2 | 5 | 10      | Aceptar  | Mantener actualizado. |
| express-session         | 1.15.6  | MIT      | 2025-07-17                | Sesión  | 4 | 5 | 20      | Mitigar  | Actualizar a 1.18.x; revisar cookies/secret. |
| socket.io               | 1.7.4   | MIT      | 2025-05-08                | Tiempo real | 5 | 4 | 20  | Evitar   | Actualizar a 4.x o retirar si no se usa. |
| swig                    | 1.4.2   | MIT      | 2022-06-27                | Plantillas | 4 | 3 | 12    | Mitigar  | Reemplazar (Nunjucks/EJS) o endurecer escapes. |
| consolidate             | 0.15.1  | MIT      | 2024-10-22                | Plantillas | 3 | 2 | 6     | Aceptar  | Actualizar cuando sea seguro. |

Notas:
- Las puntuaciones consideran antigüedad relativa, criticidad en runtime y mantenimiento.
- Ajusta P/I según hallazgos de `npm audit`/OSV si se requieren decisiones formales.
