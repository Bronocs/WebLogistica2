// pages/api/productos.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8')
    );

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const spreadsheetId = process.env.SHEET_SKUS_ID; // reemplaza esto
    const range = 'SKUs!A2:C'; // ajusta según tus columnas

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const valores = response.data.values || [];

    const productos = valores.map((fila) => ({
      nombre: fila[0] || '',
      codigo: fila[1] || '',
      unidad: fila[2] || '',
    }));

    res.status(200).json(productos);
  } catch (error) {
    console.error('Error al leer Google Sheets:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
