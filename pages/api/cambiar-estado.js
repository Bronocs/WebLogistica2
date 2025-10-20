import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });
  const { numeroOrden, nuevoEstado, resultado } = req.body;
  if (!numeroOrden || !nuevoEstado) return res.status(400).json({ error: 'Datos faltantes' });

  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8')
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SHEET_PEDIDOS_ID;
    const rango = 'Pedidos_web!A2:K'; // Ahora incluye columna I (índice 8)

    // Leer todos los pedidos
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rango,
    });
    const filas = response.data.values || [];

    // Identificar filas a cambiar por número de orden
    let editadas = 0;
    const hoy = new Date().toLocaleDateString('es-PE');
    filas.forEach(fila => {
      if (fila[0] === numeroOrden) {
        fila[8] = nuevoEstado; // Estado
        fila[9] = nuevoEstado === "entregada" ? hoy : ""; // Fecha de entrega
        fila[10] = nuevoEstado === "entregada" ? resultado : "";
        editadas++;
      }
    });

    // Sobrescribe todas las filas (menos encabezado)
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: rango,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: filas }
    });

    res.status(200).json({ message: `OC actualizada (${editadas} filas modificadas)` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error cambiando estado' });
  }
}