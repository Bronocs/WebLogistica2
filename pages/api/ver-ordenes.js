// pages/api/ver-ordenes.js
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

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_PEDIDOS_ID,
      range: 'Pedidos_web!A2:L',
    });

    const rows = response.data.values || [];
    res.status(200).json(rows);
  } catch (error) {
    console.error('Error al leer órdenes:', error);
    res.status(500).json({ error: 'Error al leer órdenes' });
  }
}
