// pages/api/guardar.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8')
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    const { tipo, productos, fecha_actual, hora_actual} = req.body;
    if (!tipo || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const spreadsheetId = process.env.SHEET_PRODUCTOS_ID;    

    const valores = productos.map(prod => [
      fecha_actual,
      hora_actual,
      tipo,
      "" || '',
      prod.producto || '',
      prod.cantidad || ''
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Historial de stock!A2:F',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: valores },
    });

    res.status(200).json({ message: 'Stock actualizado'});
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
}
