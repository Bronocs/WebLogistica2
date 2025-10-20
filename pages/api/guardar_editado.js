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

    const {numeroPedido, nombreProyecto, productos, eliminados } = req.body;
    if (!nombreProyecto || !Array.isArray(productos) || productos.length === 0) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const spreadsheetId = process.env.SHEET_PEDIDOS_ID;
    const fechaActual = new Date().toLocaleDateString('es-PE');
    const { DateTime } = require('luxon');
    const horaActual = DateTime.now().setZone('America/Lima').toFormat('HH:mm:ss');
    const aActualizar = [];
    const aAgregar = [];

    if (Array.isArray(eliminados) && eliminados.length > 0) {
      for (const idx of eliminados) {
        // Borra los valores de la fila (vacía toda la fila, NO la elimina físicamente, porque Sheets no tiene deleteRow por API)
        await sheets.spreadsheets.values.clear({
          spreadsheetId,
          range: `Pedidos_web!A${idx}:H${idx}` // asumiendo 8 columnas
        });
      }
    }

    for (const prod of productos) {
      if (prod._rowIndex) {
        aActualizar.push(prod);
      } else {
        aAgregar.push(prod);
      }
    }

    for (const prod of aActualizar) {
      const filaSheets = Number(prod._rowIndex);
      const valores = [
        numeroPedido,
        nombreProyecto,
        fechaActual,
        horaActual,
        prod.producto || '',
        "",
        prod.cantidad || '',
        ""
      ];
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `Pedidos_web!A${filaSheets}:H${filaSheets}`,
        valueInputOption: 'USER_ENTERED',
        requestBody: { values: [valores] }
      });
    }

    if (aAgregar.length > 0) {
      const valores = aAgregar.map(prod => [
        numeroPedido,
        nombreProyecto,
        fechaActual,
        horaActual,
        prod.producto || '',
        "",
        prod.cantidad || '',
        ""
      ]);
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: 'Pedidos_web!A2:H',
        valueInputOption: 'USER_ENTERED',
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: valores }
      });
    }

    res.status(200).json({ message: 'Pedido editado', numeroPedido});
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
}
