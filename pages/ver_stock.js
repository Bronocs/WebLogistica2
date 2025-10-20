// pages/ver-ordenes.js
import { useEffect, useState } from 'react';
import styles from '../styles/VerOrdenes.module.css';

export default function VerOrdenes() {
  const [ordenes, setOrdenes] = useState([]);
  const [showDelivered, setShowDelivered] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/ver-productos_retail');
      const data = await res.json();
      setOrdenes(data);
    }
    fetchData();
  }, []);

  // Extrae campos relevantes de cada fila
  const parsed = ordenes.map(row_retail => ({
    nombre_producto:      row_retail[0] || '',
    stock_fisico:      row_retail[1] || '',
    pendientes:    row_retail[2] || '',
    unidad:  row_retail[3]  || '',
    hora_comprobacion:  row_retail[4] || '',
    fecha_comprobacion:     row_retail[5] || '',
  }));

  let hora = "";
  let fecha = "";

  if (parsed.length > 0) {
    hora = parsed[0].hora_comprobacion;
    fecha = parsed[0].fecha_comprobacion;
  }
  const quitarAcentos = str => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const filtered = parsed.filter(item => {
    if (!search.trim()) return true;
    const fields = [
      item.nombre_producto,
      item.unidad,
    ].map(str => quitarAcentos((str || '').toLowerCase()));
    const searchWords = quitarAcentos(search.trim().toLowerCase()).split(/\s+/);
    return searchWords.every(word =>
      fields.some(field => field.includes(word))
    );
  });

  return (
    <div className={styles.container}>
      <div className={styles.header2}>
        <button type="button" className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={() => window.location.href = '/'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
          </svg>
        </button>
        <h1 className={styles.btnLibre2}>Registro de Stock</h1>
        <button className={`${styles.iconBtn2} ${styles.btnCerrar2}`} style={{ visibility: "hidden" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </button>
      </div>

      <h3>Actualizado {fecha} a las {hora}</h3>

      <input
        type="text"
        placeholder="Buscar producto"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className={styles.search}
      />

      <ul className={styles.list}>
        {filtered.map((o, i) => (
          <li key={i} className={styles.item}>
            <div>
              <strong>Producto:</strong> {o.nombre_producto} &nbsp;
            </div>
            <div>
              <strong>Unidad de medida:</strong> {o.unidad}
            </div>
            <div>
              <strong>Stock Físico:</strong> {o.stock_fisico} &nbsp; |
              &nbsp; <strong>Pendientes:</strong> {o.pendientes}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
