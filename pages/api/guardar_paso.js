import { google } from 'googleapis';

function colLetter(n) {
  let result = '';
  while (n > 0) {
    let rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
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

    const { paso_actual, datos, nombreOC } = req.body;
    if (
      typeof paso_actual !== 'number' ||
      !Array.isArray(datos) ||
      datos.length === 0 ||
      !nombreOC
    ) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    const spreadsheetId = process.env.SHEET_RETAIL_ID;
    const hoja = 'Registro ventas 2.0';

    // 1. Buscar fila por nombreOC en columna K
    const readResp = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${hoja}!K2:K`,
    });
    const ocColumn = readResp.data.values ? readResp.data.values.map(row => row[0]) : [];
    const fila = ocColumn.findIndex(val => (val || '').toString() === nombreOC);
    if (fila === -1) {
      return res.status(404).json({ error: 'No se encontró la OC en la hoja' });
    }
    const filaSheets = fila + 2; // +2 por encabezado y base 1

    // 2. Leer lo existente desde AG (col 33) hasta, por ejemplo, 100 columnas a la derecha (ajusta según tu máxima cantidad)
    const colInicio = 33;
    const colFinal = 33 + 99; // AG ... (por ejemplo, columna final para 100 campos)
    const rangoCompleto = `${hoja}!${colLetter(colInicio)}${filaSheets}:${colLetter(colFinal)}${filaSheets}`;
    const respExist = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rangoCompleto,
    });
    const existentes = (respExist.data.values && respExist.data.values[0]) ? respExist.data.values[0] : [];

    // 3. Mezcla: pon los datos nuevos en las primeras posiciones, deja los otros como estaban
    const actualizados = [];
    for (let i = 0; i < Math.max(existentes.length, datos.length); i++) {
      actualizados[i] = (i < datos.length && datos[i] !== undefined && datos[i] !== null && datos[i] !== '') ? datos[i] : (existentes[i] || '');
    }

    // 4. Vuelve a escribir TODO el rango, así no borra lo previo
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: rangoCompleto,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [actualizados] }
    });

    res.status(200).json({ message: 'Paso actualizado correctamente.' });
  } catch (error) {
    console.error('Error al guardar en Google Sheets:', error);
    res.status(500).json({ error: 'Error al guardar en Sheets' });
  }
}
