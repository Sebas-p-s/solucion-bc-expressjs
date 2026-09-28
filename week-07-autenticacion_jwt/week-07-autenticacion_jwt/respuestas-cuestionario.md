# Respuestas del cuestionario — Semana 07: Autenticación con JWT

**Autor:** Juan Sebastián Pachón Sandoval

**1. ¿Por qué no guardar contraseñas en texto plano y por qué MD5/SHA-256 no sirven?**
Si se filtra la base de datos, todas las contraseñas quedan a la vista, y como la gente las repite en otros sitios el daño se multiplica. MD5 y SHA-256 fueron hechos para ser rápidos: con una GPU se prueban miles de millones de intentos por segundo. Además, sin salt, la misma contraseña siempre da el mismo hash, así que sirven las tablas precalculadas. bcrypt es lento a propósito y se puede hacer más lento con los salt rounds.

**2. ¿Qué es el salt en bcrypt y cómo frena las rainbow tables?**
Es un texto aleatorio que se mezcla con la contraseña antes de hashear (bcrypt lo genera solo y lo guarda dentro del propio hash). Así dos usuarios con la misma contraseña tienen hashes distintos, y una rainbow table (hashes ya calculados de contraseñas comunes) no sirve: el atacante tendría que atacar cada hash por separado.

**3. Las tres partes de un JWT. ¿Por qué el payload se puede leer pero no modificar?**
El header dice el algoritmo y el tipo, el payload lleva los claims (`sub`, `role`, `iat`, `exp`...) y la signature es una firma calculada con `header.payload` y un secreto. Header y payload solo están en base64url, o sea que cualquiera los decodifica. Pero si alguien cambia el payload, la firma ya no coincide y el servidor rechaza el token, porque solo el servidor conoce el secreto.

**4. Access token vs refresh token, y por qué duran distinto.**
El access token viaja en cada petición y dura poco (15 min): si lo roban, la ventana de daño es corta. El refresh token dura más (7 días), solo sirve para pedir un access nuevo y solo se manda a las rutas de `/auth`. Como se guarda hasheado en la base de datos, se puede revocar. Así el usuario no tiene que loguearse cada 15 minutos sin sacrificar seguridad.

**5. ¿Por qué una cookie HttpOnly es más segura que localStorage?**
Porque JavaScript no puede leerla (`document.cookie` no la muestra). Si hay un XSS, el script malicioso no puede robar el token. Todo lo que está en `localStorage` lo puede leer cualquier script de la página.

**6. ¿Qué es la rotación de refresh tokens y qué problema resuelve?**
Cada vez que se usa `/refresh` se emite un refresh token nuevo y el anterior se invalida (se reemplaza el hash guardado en la base de datos). Si alguien roba un refresh token y lo usa después de que el usuario real ya rotó, el servidor lo rechaza. Limita mucho el tiempo que sirve un token robado.

**7. Si el token es válido pero ya expiró, ¿qué responde el middleware?**
`401 Unauthorized`, con un mensaje tipo "Token expirado" (se detecta con `TokenExpiredError`). El cliente entonces puede llamar a `/auth/refresh` para pedir uno nuevo.

**8. ¿Por qué el login devuelve el mismo error para email inexistente y contraseña incorrecta?**
Para evitar la enumeración de usuarios. Si los mensajes fueran distintos, un atacante podría probar correos y saber cuáles están registrados, y luego atacar solo a esos (fuerza bruta o phishing dirigido).

**9. ¿Qué hace `{ select: false }` y por qué se usa en `password`?**
Hace que ese campo no venga en los resultados de las consultas por defecto. Así el hash de la contraseña no se filtra por accidente en una respuesta. Cuando sí se necesita (en el login) se pide explícitamente con `.select('+password')`.

**10. ¿Cuántos secretos JWT se usan y por qué dos y no uno?**
Dos: `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`. Si fuera el mismo, un access token podría pasar por refresh token (o al revés) y si se filtra un secreto quedarían comprometidos los dos tipos de token. Con secretos distintos cada función de verificación solo acepta su tipo de token y se pueden cambiar de forma independiente.
