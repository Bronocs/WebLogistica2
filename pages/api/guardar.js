// pages/api/guardar.js
import { google } from 'googleapis';

async function generarNumeroOrden(sheets, spreadsheetId) {
  // 1. Leemos todos los códigos de orden en la columna A
  const resp = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: 'Pedidos_web!A2:A',
    majorDimension: 'COLUMNS',
  });
  const codigos = resp.data.values?.[0] || [];

  // 2. Extraemos todos los DP válidos y parseamos año, mes, correlativo
  const pedidos = codigos
    .filter(c => typeof c === 'string' && /^DP-\d{4}-\d{2}-\d{3}$/.test(c))
    .map(c => {
      const [, anio, mes, corr] = c.split('-');
      return { c, anio: Number(anio), mes: Number(mes), corr: Number(corr) };
    });

  // 3. Encontrar el mayor año, luego mes, luego correlativo
  pedidos.sort((a, b) => {
    if (a.anio !== b.anio) return b.anio - a.anio;
    if (a.mes !== b.mes) return b.mes - a.mes;
    return b.corr - a.corr;
  });

  const ahora = new Date();
  const year = ahora.getFullYear().toString();
  const month = String(ahora.getMonth() + 1).padStart(2, '0');

  let secuencia = 1;
  if (pedidos.length > 0 && pedidos[0].anio == year && String(pedidos[0].mes).padStart(2, '0') == month) {
    secuencia = pedidos[0].corr + 1;
  }
  const seqStr = String(secuencia).padStart(3, '0');
  return `DP-${year}-${month}-${seqStr}`;
}


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

    const { nombreProyecto, productos } = req.body;
    if (!nombreProyecto || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const spreadsheetId = process.env.SHEET_PEDIDOS_ID;
    const numeroOrden = await generarNumeroOrden(sheets, spreadsheetId);
    const fechaActual = new Date().toLocaleDateString('es-PE');
    const { DateTime } = require('luxon');
    const horaActual = DateTime.now().setZone('America/Lima').toFormat('HH:mm:ss');



    const valores = productos.map(prod => [
      numeroOrden,
      nombreProyecto,
      fechaActual,
      horaActual,
      prod.producto || '',
      "" || '',
      prod.cantidad || '',
      "" || ''
    ]);

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Pedidos_web!A2:H',
      valueInputOption: 'USER_ENTERED',
      insertDataOption: 'INSERT_ROWS',
      requestBody: { values: valores },
    });

    res.status(200).json({ message: 'Pedido guardado', numeroOrden });
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
}
