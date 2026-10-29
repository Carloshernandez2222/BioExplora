# Conectar la encuesta con Google Sheets

Se hace una sola vez, con la cuenta de Google de la dueña del proyecto.

1. Crea una hoja nueva en https://sheets.new y ponle un nombre (por ejemplo, "Encuesta BioExplora").
2. En la hoja: menú **Extensiones → Apps Script**.
3. Borra lo que aparece y pega todo el contenido de `google-sheets/Code.gs`. Guarda (ícono de disquete).
4. Botón **Implementar → Nueva implementación**.
   - Tipo (ícono de engranaje): **Aplicación web**.
   - Ejecutar como: **Yo**.
   - Quién tiene acceso: **Cualquier usuario**.
   - Clic en **Implementar** y autoriza los permisos que pide Google (es tu propio script).
5. Copia la **URL de la aplicación web** (termina en `/exec`).
6. En el proyecto, en el archivo `.env`, pon:

   ```
   VITE_SHEETS_URL=https://script.google.com/macros/s/XXXXXXXX/exec
   ```

   (En Netlify o Vercel se agrega como variable de entorno con ese mismo nombre.)
7. Vuelve a ejecutar `npm run build` y publica.

## Qué pasa después

- Cada respuesta de la encuesta llega como una fila nueva en la pestaña **Respuestas** de la hoja.
- La pestaña "Resultados" del sitio muestra los gráficos con **todas** las respuestas.
- El nombre y el comentario **no** se muestran en el sitio: solo se ven en la hoja.
- El Excel completo (con nombres y comentarios) se descarga desde la hoja: **Archivo → Descargar → Microsoft Excel**.

## Si cambias el script

Después de editar `Code.gs`: **Implementar → Administrar implementaciones → editar (lápiz) → Versión: Nueva versión → Implementar**. La URL no cambia.
