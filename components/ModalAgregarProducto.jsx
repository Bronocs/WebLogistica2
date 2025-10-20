import { useState, useRef } from 'react';
import debounce from 'lodash.debounce';
import styles from '../styles/Modal.module.css';
import { algoliasearch } from "algoliasearch";

export default function ModalAgregarProducto({ onClose, onAgregar }) {
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  const [modoLibre, setModoLibre] = useState(false);
  const [cantidad, setCantidad] = useState('');
  const [comentario, setComentario] = useState('');
  const [nombreLibre, setNombreLibre] = useState('');
  const [unidadLibre, setUnidadLibre] = useState('');
  const [cargando, setCargando] = useState(false);
  const [sugerencias, setSugerencias] = useState('');

  const comentarioRef = useRef(null);
  const client = algoliasearch(process.env.NEXT_PUBLIC_TU_APPLICATION_ID, process.env.NEXT_PUBLIC_TU_SEARCH_API_KEY);

  // Algolia search con debounce
  const debouncedBuscar = useRef(
    debounce(async (consulta) => {
      setCargando(true);
      setResultados([]);
      setSugerencias('');
      if (!consulta || consulta.trim().length < 2) {
        setCargando(false);
        return;
      }
      try {
        const res = await client.searchSingleIndex({indexName: process.env.NEXT_PUBLIC_ALGOLIA_INDEX_NAME,searchParams: {query: consulta},});
        if (res.hits && res.hits.length > 0) {
          console.log(res.hits)
          setResultados(res.hits);
        } else {
          setResultados([]);
          setSugerencias('No se encontraron resultados en el catálogo.');
        }
      } catch (e) {
        setResultados([]);
        setSugerencias('Error en la búsqueda.');
      }
      setCargando(false);
    }, 700)
  ).current;

  // Maneja búsqueda en tiempo real
  const handleInputChange = e => {
    setBusqueda(e.target.value);
    debouncedBuscar(e.target.value);
    setNombreLibre(e.target.value)
  };

  const handleSubmit = () => {
    const fecha = new Date().toLocaleDateString('es-PE');
    const producto = modoLibre
      ? { fecha, nombre: nombreLibre, unidad: unidadLibre, cantidad, comentario }
      : { fecha, nombre: seleccionado.arreglo_descripcion, unidad: seleccionado.producto, cantidad, comentario };
    if ((modoLibre && nombreLibre && unidadLibre && cantidad) || (!modoLibre && seleccionado && cantidad)) {
      onAgregar(producto);
      onClose();
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <button type="button" className={`${styles.iconBtn} ${styles.btnAtras}`} onClick={e => {setSeleccionado(null); setModoLibre(false);}}>
            ←
          </button>
          <button className={styles.btnLibre} onClick={() => {
              setModoLibre(true);
              setSeleccionado(null);
              setBusqueda('');
              setResultados([]);
              setSugerencias('');
            }}>
              + LIBRE
          </button>
          <button type="button" className={`${styles.iconBtn} ${styles.btnCerrar}`} onClick={onClose}>✕
          </button>
        </div>        

        {!modoLibre && !seleccionado && (
          <>
            <div className={styles.searchBar}>
              <input
                type="text"
                placeholder="Buscar producto por nombre o código"
                value={busqueda}
                onChange={handleInputChange}
              />
            </div>

            <div className={styles.lista}>
              {cargando ? (
                <p className={styles.sinDatos}>Buscando...</p>
              ) : resultados.length === 0 ? (
                <p className={styles.sinDatos}>Sin datos</p>
              ) : (
                resultados.map((item, i) => (
                  <div key={i} className={styles.item} onClick={() => setSeleccionado(item)}>
                    <div>
                      <strong>{item.arreglo_descripcion}</strong>
                      <div className={styles.codigo}>{item.Detalles}</div>
                    </div>
                    <div className={styles.unidad}>{item.producto}</div>
                  </div>
                ))
              )}
            </div>

            {!resultados.length && sugerencias && (
              <div className={styles.sugerencias}>
                <strong>¿Quizás buscabas?</strong>
                <div>{sugerencias}</div>
              </div>
            )}
          </>
        )}

        {(modoLibre || seleccionado) && (
          <div className={styles.formulario}>
            {modoLibre && (
              <>
                <input
                  type="text"
                  placeholder="Nombre del producto"
                  value={nombreLibre}
                  onChange={e => setNombreLibre(e.target.value)}
                  required
                />
                <input
                  type="text"
                  placeholder="Unidad (ej: KG, UND...)"
                  value={unidadLibre}
                  onChange={e => setUnidadLibre(e.target.value)}
                  required
                />
              </>
            )}
            {!modoLibre && <p><strong>{seleccionado?.arreglo_descripcion}</strong></p>}
            <input
              type="number"
              placeholder="Cantidad"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              required
            />
            <textarea
              name="comentario"
              className={styles.textarea}
              placeholder="Comentario (opcional)"
              value={comentario}
              onChange={e => setComentario(e.target.value)}
              ref={comentarioRef}
            />

            <button className={styles.btnAgregar} onClick={handleSubmit}>Agregar</button>
          </div>
        )}
      </div>
    </div>
  );
}
