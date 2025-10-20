// pages/api/encontrar_orden.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  try {
    // 1. Recibe el nombre por query string
    const { nombrePedido } = req.query;
    console.log(nombrePedido);
    if (!nombrePedido) {
      return res.status(400).json({ error: 'Falta el nombre del pedido' });
    }

    console.log(nombrePedido);

    // 2. Conexión igual que antes
    const credentials = JSON.parse(
      Buffer.from(process.env.GOOGLE_CREDENTIALS, 'base64').toString('utf8')
    );
    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // 3. Lee toda la hoja (o un rango específico)
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.SHEET_PEDIDOS_ID,
      range: 'Pedidos_web!A2:J',
    });

    const rows = response.data.values || [];

    // 4. Filtra las filas y agrega el índice real de la hoja (base 2 por el encabezado)
    const filtradas = rows
      .map((row, idx) => ({
        _rowIndex: idx + 2, // La fila real en Sheets, considerando que tu rango empieza en A2
        ...row
      }))
      .filter(item => (item[0] || '').toString() === nombrePedido);

    res.status(200).json(filtradas);
  } catch (error) {
    console.error('Error al leer órdenes:', error);
    res.status(500).json({ error: 'Error al leer órdenes' });
  }
}
