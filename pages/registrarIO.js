import { useEffect, useState, useRef } from 'react';
import styles from '../styles/Home.module.css';
import React from 'react';

export default function Agregar() {
  const [materiales, setMateriales] = useState([
    { cantidad: '', producto: '' }
  ]);
  const [nombreProyecto, setNombreProyecto] = useState('');


  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(null); // para guardar el número de orden
  const [alerta, setAlerta] = useState(null); // para mostrar errores
  const [productosDB, setProductosDB] = useState([]);
  const [sugerencias, setSugerencias] = useState([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
  const [indiceActivo, setIndiceActivo] = useState(-1);
  const [indiceSugerencias, setIndiceSugerencias] = useState(null);
  const [tipoMovimiento, setTipoMovimiento] = useState(''); // Inicia en blanco
  const cantidadRefs = useRef([]);
  const productoRefs = useRef([]);
  const selectorRef = useRef(null);
  const [filasInvalidas, setFilasInvalidas] = useState([]);
  const [cantidadesInvalidas, setCantidadesInvalidas] = useState([]);
  const [productosInvalidos, setProductosInvalidos] = useState([]);
  const [keyEnviado, setKeyEnviado] = useState(false);
  const [erroresActivos, setErroresActivos] = useState(false);
  const [camposConErrorPrevio, setCamposConErrorPrevio] = useState(new Set());
  const [parpadeoActivo, setParpadeoActivo] = useState(false);



  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/ver-productos_retail');
      const data = await res.json();
      // Extraer y guardar los productos relevantes
      const parsed = data.map(row => ({
        nombre_producto: row[0] || '',
        stock_fisico: row[1] || '',
        pendientes: row[2] || '',
        unidad: row[3] || '',
        hora_comprobacion: row[4] || '',
        fecha_comprobacion: row[5] || '',
      }));
      console.log(parsed);
      setProductosDB(parsed);
    }
    fetchData();
  }, []);

  function getFechaHoraActual() {
    const now = new Date();

    // Fecha en formato dd/MM/yyyy
    const dia = String(now.getDate()).padStart(2, '0');
    const mes = String(now.getMonth() + 1).padStart(2, '0'); // Enero es 0
    const anio = now.getFullYear();

    const fecha = `${dia}/${mes}/${anio}`;

    // Hora en formato HH:mm:ss
    const hora = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const seg = String(now.getSeconds()).padStart(2, '0');

    const horaActual = `${hora}:${min}:${seg}`;

    return { fecha, hora: horaActual };
  }


  const esCantidadValida = (valor) => {
    const num = Number(valor);
    if (isNaN(num) || num <= 0) return false;

    const partes = valor.split('.');
    if (partes.length === 2 && partes[1].length > 2) return false;

    return true;
  };

  // Función helper para validar según el tipo de campo
  const esValido = (campo, valor) => {
    if (campo === 'cantidad') {
      return esCantidadValida(valor);
    }
    if (campo === 'producto') {
      return valor.trim() !== '';
    }
    return true;
  };

  // Funciones para manejar errores
  const agregarError = (idx, campo) => {
    if (campo === 'cantidad') {
      setCantidadesInvalidas(prev => (prev.includes(idx) ? prev : [...prev, idx]));
    } else if (campo === 'producto') {
      setProductosInvalidos(prev => (prev.includes(idx) ? prev : [...prev, idx]));
    }
  };

  const quitarError = (idx, campo) => {
    if (campo === 'cantidad') {
      setCantidadesInvalidas(prev => prev.filter(i => i !== idx));
    } else if (campo === 'producto') {
      setProductosInvalidos(prev => prev.filter(i => i !== idx));
    }
  };

  // Validación inteligente
  const validacionInteligente = (idx, campo, valor, evento) => {
    const claveField = `${idx}-${campo}`;
    const yaTenieError = camposConErrorPrevio.has(claveField);
    
    // CASO 1: Campo que ya tenía error -> Validar onChange (feedback rápido al corregir)
    if (yaTenieError && evento === 'change') {
      // 🎯 VALIDACIÓN ESPECIAL: Para campos que fallan por estar vacíos cuando el otro tiene contenido
      const fila = materiales[idx];
      const esValido_actualizado = 
        campo === 'cantidad' ? esCantidadValida(valor) : valor.trim() !== '';
      
      // Si el campo se está corrigiendo (ahora es válido), quitar error
      if (esValido_actualizado) {
        quitarError(idx, campo);
        setCamposConErrorPrevio(prev => {
          const nuevo = new Set(prev);
          nuevo.delete(claveField);
          return nuevo;
        });
      }
      return;
    }
    
    // CASO 2: Campo nuevo -> Solo validar onBlur o onEnter/Tab
    if (!yaTenieError && (evento === 'blur' || evento === 'keydown')) {
      const fila = materiales[idx]; 
      const esUltimaFila = idx === materiales.length - 1;
      const filaCompletamenteVacia = !fila.cantidad.trim() && !fila.producto.trim();
      
      // Excepción: Si es última fila Y está completamente vacía, no validar
      if (esUltimaFila && filaCompletamenteVacia) return;
      
      // Para todas las demás filas (incluyendo última fila con contenido), validar normalmente
      if (!esValido(campo, valor)) {
        agregarError(idx, campo);
        setCamposConErrorPrevio(prev => new Set([...prev, claveField]));
      }
    }
  };

  const handleProductoChange = (idx, valor) => {
    handleInputChange(idx, 'producto', valor);
    setIndiceSugerencias(idx);
    if (valor.trim() === '') {
      setSugerencias([]);
      setMostrarSugerencias(false);
      setIndiceActivo(-1);
      return;
    }
    const filtro = valor.toLowerCase();
    const filtrados = productosDB.filter(p =>
      p.nombre_producto.toLowerCase().includes(filtro) || 
      (p.unidad && p.unidad.toLowerCase().includes(filtro))
    );
    console.log('Sugerencias encontradas:', filtrados.slice(0, 10));
    console.log(getMaterialesFinal());
    setSugerencias(filtrados.slice(0, 10));
    setMostrarSugerencias(true);
    setIndiceActivo(-1);
  };

  const seleccionarSugerencia = (idxMaterial, sugerencia) => {
    handleInputChange(idxMaterial, 'producto', sugerencia.nombre_producto);
    setSugerencias([]);
    setMostrarSugerencias(false);
    setIndiceSugerencias(null);
    setIndiceActivo(-1);
  };

  


  // Maneja cambios en los inputs de la tabla
const handleInputChange = (idx, campo, valor) => {
  const nuevosMateriales = materiales.map((mat, i) =>
    i === idx ? { ...mat, [campo]: valor } : mat
  );

  // Si esta es la última fila y tiene datos en ambos campos, agrega una nueva fila vacía
  let materialesActualizados = nuevosMateriales;
  if (
    idx === materiales.length - 1 &&
    nuevosMateriales[idx].cantidad.trim() &&
    nuevosMateriales[idx].producto.trim()
  ) {
    materialesActualizados = [...nuevosMateriales, { cantidad: '', producto: '' }];
  }

  // Elimina filas vacías, dejando solo UNA al final
  const noVacias = materialesActualizados.filter(
    (m, i) =>
      i === materialesActualizados.length - 1 ||
      m.cantidad.trim() !== '' ||
      m.producto.trim() !== ''
  );

  setMateriales(noVacias);

  // 🚨 REINDEXAR ERRORES cuando cambia la estructura de filas
  if (noVacias.length !== materiales.length) {
    // Se eliminaron filas, necesitamos reindexar los errores
    const nuevasCantidadesInvalidas = [];
    const nuevosProductosInvalidos = [];
    const nuevosCamposConError = new Set();

    // Para cada fila actual, verificar si tiene errores reales
    noVacias.forEach((fila, nuevoIdx) => {
      const esUltimaFila = nuevoIdx === noVacias.length - 1;
      const filaCompletamenteVacia = !fila.cantidad.trim() && !fila.producto.trim();
      
      // Excepción: Solo skip si es última fila Y está completamente vacía
      if (esUltimaFila && filaCompletamenteVacia) {
        return;
      }

      // Para todas las demás filas (incluyendo última con contenido), verificar errores normalmente
      if (fila.cantidad.trim() && !esCantidadValida(fila.cantidad)) {
        nuevasCantidadesInvalidas.push(nuevoIdx);
        nuevosCamposConError.add(`${nuevoIdx}-cantidad`);
      }
      
      if (!fila.producto.trim() && fila.cantidad.trim()) {
        nuevosProductosInvalidos.push(nuevoIdx);
        nuevosCamposConError.add(`${nuevoIdx}-producto`);
      }
      
      if (!fila.cantidad.trim() && fila.producto.trim()) {
        nuevasCantidadesInvalidas.push(nuevoIdx);
        nuevosCamposConError.add(`${nuevoIdx}-cantidad`);
      }
    });

    setCantidadesInvalidas(nuevasCantidadesInvalidas);
    setProductosInvalidos(nuevosProductosInvalidos);
    setCamposConErrorPrevio(nuevosCamposConError);
  }

  // 🚨 LIMPIAR ERROR de la última fila SOLO si está completamente vacía
  const ultimaFila = noVacias.length - 1;
  const filaFinal = noVacias[ultimaFila];
  if (filaFinal && !filaFinal.cantidad.trim() && !filaFinal.producto.trim()) {
    // Solo limpiar si está completamente vacía - así debe mantenerse la última fila
    setCantidadesInvalidas(prev => prev.filter(i => i !== ultimaFila));
    setProductosInvalidos(prev => prev.filter(i => i !== ultimaFila));
    setCamposConErrorPrevio(prev => {
      const nuevo = new Set(prev);
      nuevo.delete(`${ultimaFila}-cantidad`);
      nuevo.delete(`${ultimaFila}-producto`);
      return nuevo;
    });
  }
};

  // Eliminar filas vacías antes de enviar
  const getMaterialesFinal = () =>
    materiales.filter(
      m => m.cantidad.trim() !== '' && m.producto.trim() !== ''
    );

  const comprobarLlenado = () => {
    const invalidas = [];

    for (let i = 0; i < materiales.length; i++) {
      const fila = materiales[i];
      const incompleta = (fila.cantidad === '' && fila.producto !== '') || 
                        (fila.cantidad !== '' && fila.producto === '');
      if (incompleta) {
        invalidas.push(i); // guarda el índice
      }
    }

    setFilasInvalidas(invalidas);
    return invalidas.length === 0;
  };

  const cambiarColorSelector = () => {
    // La validación visual se maneja dinámicamente en el estilo del select
  }

  // Envía los materiales (ejemplo)
  const enviarPedidos = async () => {
    const { fecha, hora } = getFechaHoraActual();
    const materialesFinal = getMaterialesFinal();
    let tipo = "";

    if (tipoMovimiento == 'Entrada'){
      tipo = "E";
    }

    if (tipoMovimiento == 'Salida'){
      tipo = "S";
    }

    // Verificar si hay errores de validación activos
    if (cantidadesInvalidas.length > 0 || productosInvalidos.length > 0) {
      setAlerta('Por favor corrige todos los errores antes de enviar');
      setKeyEnviado(true);
      return;
    }

    if (!tipoMovimiento.trim()) {
      setKeyEnviado(true);
      return;
    }
    // 🎯 VALIDACIÓN ESPECIAL AL ENVIAR: Verificar última fila PARCIALMENTE completa (no completamente vacía)
    const ultimaFilaIdx = materiales.length - 1;
    const ultimaFila = materiales[ultimaFilaIdx];
    const tieneUltimaFilaParcial = ultimaFila && 
      ((ultimaFila.cantidad.trim() && !ultimaFila.producto.trim()) || 
       (!ultimaFila.cantidad.trim() && ultimaFila.producto.trim()));
    
    if (tieneUltimaFilaParcial) {
      console.log('🚨 ÚLTIMA FILA PARCIAL DETECTADA AL ENVIAR:', ultimaFila);
      
      // Agregar errores visuales a la última fila
      if (ultimaFila.cantidad.trim() && !ultimaFila.producto.trim()) {
        setProductosInvalidos(prev => prev.includes(ultimaFilaIdx) ? prev : [...prev, ultimaFilaIdx]);
        setCamposConErrorPrevio(prev => new Set([...prev, `${ultimaFilaIdx}-producto`]));
      }
      if (!ultimaFila.cantidad.trim() && ultimaFila.producto.trim()) {
        setCantidadesInvalidas(prev => prev.includes(ultimaFilaIdx) ? prev : [...prev, ultimaFilaIdx]);
        setCamposConErrorPrevio(prev => new Set([...prev, `${ultimaFilaIdx}-cantidad`]));
      }
      
      setAlerta('Por favor completa todos los campos de la última fila');
      setKeyEnviado(true);
      // Activar parpadeo
      setParpadeoActivo(true);
      setTimeout(() => setParpadeoActivo(false), 2000);
      return;
    }
    
    if (materialesFinal.length === 0) {
      setCantidadesInvalidas([0]);
      setProductosInvalidos([0]);
      // 🎯 IMPORTANTE: Marcar en camposConErrorPrevio para que la validación inteligente funcione
      setCamposConErrorPrevio(prev => new Set([...prev, '0-cantidad', '0-producto']));
      setKeyEnviado(true);
      // Activar parpadeo
      setParpadeoActivo(true);
      setTimeout(() => setParpadeoActivo(false), 2000);
      return;
    }
    if (!comprobarLlenado()) {
      setKeyEnviado(true);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/guardar_stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo,
          productos: materialesFinal,
          fecha_actual: fecha,
          hora_actual: hora,
        }),
      });

      setLoading(false);

      if (res.ok) {
        const data = await res.json();
        setExito(":)"); // activa el modal de éxito
        setMateriales([{ cantidad: '', producto: '' }]);
        setNombreProyecto('');
        setTipoMovimiento(''); // Resetear selector
      } else {
        setAlerta('Error al enviar el pedido');
      }
    } catch (err) {
      setLoading(false);
      console.error('Error al enviar:', err);
      setAlerta('Error de conexión');
    }
  };

  const handleKeyDownCantidad = (e, idx) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      validacionInteligente(idx, 'cantidad', materiales[idx].cantidad, 'keydown');
      productoRefs.current[idx]?.focus();
    }
  };

  const handleKeyDownProducto = (e, idx) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      validacionInteligente(idx, 'producto', materiales[idx].producto, 'keydown');
      cantidadRefs.current[idx + 1]?.focus();
    }
  };

  return (
    <div className={styles.contenedor}>
        {/* MODAL CARGANDO */}
        {loading && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.spinner}></div>
              <p style={{ marginTop: 16 }}>Enviando...</p>
            </div>
          </div>
        )}

        {alerta && (
          <div className={styles.overlay}>
            <div className={styles.modal} style={{ textAlign: "center" }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#E74C3C" />
                <path d="M16 16L32 32" stroke="white" strokeWidth="4" strokeLinecap="round" />
                <path d="M32 16L16 32" stroke="white" strokeWidth="4" strokeLinecap="round" />
              </svg>
              <p style={{ marginTop: 12, fontWeight: 500, fontSize: "18px" }}>
                {alerta}
              </p>
              <button
                onClick={() => setAlerta(null)}
                style={{
                  marginTop: 18,
                  background: "#E74C3C",
                  color: "#ffffff",
                  padding: "0.8rem 2.2rem",
                  border: "none",
                  borderRadius: "7px",
                  fontWeight: 600,
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 2px 7px #c4d8ea80"
                }}
              >
                OK                
              </button>
            </div>
          </div>
        )}

        {exito && (
          <div className={styles.overlay}>
            <div className={styles.modal} style={{ textAlign: "center" }}>
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <circle cx="24" cy="24" r="24" fill="#58D68D"/>
                <path d="M14 25.5L21.5 33L34 18" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ marginTop: 12, fontWeight: 500, fontSize: "18px" }}>
                ¡Registro exitoso!<br />
                <span style={{ fontWeight: 400, fontSize: "15px" }}>
                   <b>{exito}</b>
                </span>
              </p>
              <button
                onClick={() => window.location.href = '/'}
                style={{
                  marginTop: 18,
                  background: "#003972",
                  color: "#ffffff",
                  padding: "0.8rem 2.2rem",
                  border: "none",
                  borderRadius: "7px",
                  fontWeight: 600,
                  fontSize: "16px",
                  cursor: "pointer",
                  boxShadow: "0 2px 7px #c4d8ea80"
                }}
              >
                OK                
              </button>
            </div>
          </div>
        )}

      <div className={styles.header2}>
        <button className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={() => window.location.href = '/'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
          </svg>
        </button>
        <div className={styles.btnLibre2} style={{ margin: '1rem 0' }}>
          <select
            ref={selectorRef}
            value={tipoMovimiento}
            onChange={e => {setTipoMovimiento(e.target.value);
                            cambiarColorSelector();
            }}
            className={`${(!tipoMovimiento.trim() && keyEnviado) ? 'select-error' : ''} ${parpadeoActivo && (!tipoMovimiento.trim() && keyEnviado) ? 'parpadeo' : ''}`.trim()}
            style={{
              width: '100%',
              padding: '0.8rem',
              fontSize: '1rem',
              borderRadius: '6px',
              border: (!tipoMovimiento.trim() && keyEnviado) ? '2px solid red' : '2px solid #ccc',
              background: '#232525',
              color: '#fff'
            }}
          >
            <option value="">Seleccionar tipo de movimiento</option>
            <option value="Entrada">Entrada</option>
            <option value="Salida">Salida</option>
          </select>
        </div>
        <button className={`${styles.iconBtn2} ${styles.btnCerrar2}`} onClick={enviarPedidos}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </button>
      </div>
    {!tipoMovimiento.trim() && keyEnviado && (
      <div className={styles.header2}>
        <button className={`${styles.iconBtn3} ${styles.btnAtras2}`} onClick={() => window.location.href = '/'}
            style={{
              visibility: 'hidden',
              height: '10%',
              overflow: 'hidden'
            }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
          </svg>
        </button>
        <div className={styles.btnLibre2}>
            <div style={{ color: 'red', fontSize: '13px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14" height="14" fill="currentColor">
                <path d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.9 536.6 69.6 524.5C62.3 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 232C306.7 232 296 242.7 296 256L296 368C296 381.3 306.7 392 320 392C333.3 392 344 381.3 344 368L344 256C344 242.7 333.3 232 320 232zM346.7 448C347.3 438.1 342.4 428.7 333.9 423.5C325.4 418.4 314.7 418.4 306.2 423.5C297.7 428.7 292.8 438.1 293.4 448C292.8 457.9 297.7 467.3 306.2 472.5C314.7 477.6 325.4 477.6 333.9 472.5C342.4 467.3 347.3 457.9 346.7 448z"/>
              </svg>
              Selecciona tipo de movimiento
            </div>
        </div>
        <button className={`${styles.iconBtn3} ${styles.btnCerrar2}`} onClick={enviarPedidos}
            style={{
              visibility: 'hidden',
              height: '10%',
              overflow: 'hidden'
            }}        
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-send" viewBox="0 0 16 16">
          <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </button>
      </div>
    )}

      <div style={{width: '100%' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '23px'}}>Cant.</th>
              <th style={{ textAlign: 'left', padding: '0.5rem', fontSize: '23px' }}>Producto o Servicio</th>
            </tr>
          </thead>
          <tbody>
            {materiales.map((fila, idx) => (
                <React.Fragment key={idx}>
                  <tr>
                    <td style={{ padding: '0.3rem', width: '50px' }}>
                  <input
                    type="text"
                    ref={el => cantidadRefs.current[idx] = el}
                    value={fila.cantidad}
                    onChange={e => {
                      handleInputChange(idx, 'cantidad', e.target.value);
                      validacionInteligente(idx, 'cantidad', e.target.value, 'change');
                    }}
                    onBlur={e => {validacionInteligente(idx, 'cantidad', fila.cantidad, 'blur');
                    }}
                    onKeyDown={e => handleKeyDownCantidad(e, idx)}
                    className={`${cantidadesInvalidas.includes(idx) && (idx !== materiales.length - 1 || keyEnviado) ? 'input-error' : ''} ${parpadeoActivo && cantidadesInvalidas.includes(idx) ? 'parpadeo' : ''}`.trim()}
                    style={{
                      width: '100%',
                      height: '49px',
                      padding: '0.4rem',
                      border: cantidadesInvalidas.includes(idx) && (idx !== materiales.length - 1 || keyEnviado) ? '2px solid red' : '2px solid #ccc',
                      borderRadius: '6px',
                      fontSize: '15px',
                      boxSizing: 'border-box',
                      verticalAlign: 'middle'
                    }}
                  />
                </td>
                <td style={{ padding: '0.3rem' }}>
                  <div style={{ position: 'relative', width: '100%' }}>
                    <textarea
                      ref={el => productoRefs.current[idx] = el}
                      value={fila.producto}
                      onChange={e => {
                        handleProductoChange(idx, e.target.value);
                        validacionInteligente(idx, 'producto', e.target.value, 'change');
                      }}
                      onFocus={() => {
                        setIndiceSugerencias(idx);
                        if (fila.producto.trim()) setMostrarSugerencias(true);
                      }}
                      onBlur={() => {
                        validacionInteligente(idx, 'producto', fila.producto, 'blur');
                        setTimeout(() => {
                          setMostrarSugerencias(false);
                          setIndiceSugerencias(null);
                        }, 100);
                      }}
                      onInput={e => {
                        // Fija la altura inicial y luego autoajusta si crece
                        e.target.style.height = '49px';
                        if (e.target.scrollHeight > 49) {
                          e.target.style.height = e.target.scrollHeight + 'px';
                        }
                      }}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          validacionInteligente(idx, 'producto', fila.producto, 'keydown');
                          cantidadRefs.current[idx + 1]?.focus();
                        }
                      }}
                      className={`${productosInvalidos.includes(idx) && (idx !== materiales.length - 1 || keyEnviado) ? 'textarea-error' : ''} ${parpadeoActivo && productosInvalidos.includes(idx) ? 'parpadeo' : ''}`.trim()}
                      style={{
                        width: '100%',
                        border: productosInvalidos.includes(idx) && (idx !== materiales.length - 1 || keyEnviado) ? '2px solid red' : '2px solid #ccc',
                        borderRadius: '6px',
                        minHeight: '49px',   // <-- Mismo alto que el input
                        height: '49px',      // <-- Mismo alto que el input
                        maxHeight: '120px',
                        resize: 'none',
                        overflowY: 'hidden',
                        boxSizing: 'border-box',
                        fontSize: '15px',
                        padding: '0.4rem',
                        verticalAlign: 'middle'
                      }}
                    />
                    {mostrarSugerencias && sugerencias.length > 0 && indiceSugerencias === idx && (
                      <ul
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 9999,
                          background: '#232525',
                          border: '1px solid #555',
                          borderRadius: 6,
                          listStyle: 'none',
                          margin: 0,
                          padding: 0,
                          maxHeight: '220px',
                          overflowY: 'auto',
                          boxShadow: '0 4px 16px #0006',
                          fontSize: '15px'
                        }}
                      >
                        {sugerencias.map((s, i) => (
                          <li
                            key={s.nombre_producto + s.unidad}
                            onClick={() => seleccionarSugerencia(idx, s)}
                            style={{
                              padding: '8px 14px',
                              background: indiceActivo === i ? '#29405b' : 'transparent',
                              color: '#fff',
                              cursor: 'pointer',
                              display: 'flex',
                              justifyContent: 'space-between'
                            }}
                            onMouseEnter={() => setIndiceActivo(i)}
                            onMouseDown={() => seleccionarSugerencia(idx, s)}
                          >
                            <span>
                              <b>{s.nombre_producto}</b>
                              {s.unidad && <span style={{ color: '#9ca3af', fontSize: 13 }}> ({s.unidad})</span>}
                            </span>
                            {s.stock_fisico && <span style={{ color: '#58D68D', fontSize: 13 }}>Stock: {s.stock_fisico}</span>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </td>
                  </tr>

                  {/* Fila para mostrar mensaje de error */}
                  {(productosInvalidos.includes(idx) || cantidadesInvalidas.includes(idx)) && 
                   (idx !== materiales.length - 1 || keyEnviado) && (
                    <tr>
                      <td colSpan={2} style={{ padding: '4px 8px' }}>
                        <div style={{ 
                          color: 'red', 
                          fontSize: '13px',
                          textAlign: productosInvalidos.includes(idx) && !cantidadesInvalidas.includes(idx) ? 'center' : 'left'
                        }}>
                          {productosInvalidos.includes(idx) && !cantidadesInvalidas.includes(idx) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14" height="14" fill="currentColor">
                                <path d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.9 536.6 69.6 524.5C62.3 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 232C306.7 232 296 242.7 296 256L296 368C296 381.3 306.7 392 320 392C333.3 392 344 381.3 344 368L344 256C344 242.7 333.3 232 320 232zM346.7 448C347.3 438.1 342.4 428.7 333.9 423.5C325.4 418.4 314.7 418.4 306.2 423.5C297.7 428.7 292.8 438.1 293.4 448C292.8 457.9 297.7 467.3 306.2 472.5C314.7 477.6 325.4 477.6 333.9 472.5C342.4 467.3 347.3 457.9 346.7 448z"/>
                              </svg>
                              Falta producto
                            </div>
                          )}
                          {cantidadesInvalidas.includes(idx) && !productosInvalidos.includes(idx) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14" height="14" fill="currentColor">
                                <path d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.9 536.6 69.6 524.5C62.3 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 232C306.7 232 296 242.7 296 256L296 368C296 381.3 306.7 392 320 392C333.3 392 344 381.3 344 368L344 256C344 242.7 333.3 232 320 232zM346.7 448C347.3 438.1 342.4 428.7 333.9 423.5C325.4 418.4 314.7 418.4 306.2 423.5C297.7 428.7 292.8 438.1 293.4 448C292.8 457.9 297.7 467.3 306.2 472.5C314.7 477.6 325.4 477.6 333.9 472.5C342.4 467.3 347.3 457.9 346.7 448z"/>
                              </svg>
                              Ingresa cantidades numéricas
                            </div>
                          )}
                          {cantidadesInvalidas.includes(idx) && productosInvalidos.includes(idx) && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="14" height="14" fill="currentColor">
                                <path d="M320 64C334.7 64 348.2 72.1 355.2 85L571.2 485C577.9 497.4 577.6 512.4 570.4 524.5C563.2 536.6 550.1 544 536 544L104 544C89.9 544 76.9 536.6 69.6 524.5C62.3 512.4 62.1 497.4 68.8 485L284.8 85C291.8 72.1 305.3 64 320 64zM320 232C306.7 232 296 242.7 296 256L296 368C296 381.3 306.7 392 320 392C333.3 392 344 381.3 344 368L344 256C344 242.7 333.3 232 320 232zM346.7 448C347.3 438.1 342.4 428.7 333.9 423.5C325.4 418.4 314.7 418.4 306.2 423.5C297.7 428.7 292.8 438.1 293.4 448C292.8 457.9 297.7 467.3 306.2 472.5C314.7 477.6 325.4 477.6 333.9 472.5C342.4 467.3 347.3 457.9 346.7 448z"/>
                              </svg>
                              Falta producto y cantidad es inválida
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
          </tbody>
        </table>
      </div>
      
      <style jsx global>{`
        input, textarea {
          font-family: inherit;
          font-size: inherit;
        }
        
        input::placeholder {
          font-style: italic;
          color: #9a9a9aff;
        }
        
        .input-error {
          border: 2px solid red !important;
          box-shadow: 0 0 5px rgba(255, 0, 0, 0.3) !important;
        }
        
        .input-error:focus {
          border: 2px solid red !important;
          outline: 2px solid red !important;
          box-shadow: 0 0 8px rgba(255, 0, 0, 0.5) !important;
        }
        
        .textarea-error {
          border: 2px solid red !important;
          box-shadow: 0 0 5px rgba(255, 0, 0, 0.3) !important;
        }
        
        .textarea-error:focus {
          border: 2px solid red !important;
          outline: 2px solid red !important;
          box-shadow: 0 0 8px rgba(255, 0, 0, 0.5) !important;
        }
        
        .select-error {
          border: 2px solid red !important;
          box-shadow: 0 0 5px rgba(255, 0, 0, 0.3) !important;
        }
        
        .select-error:focus {
          border: 2px solid red !important;
          outline: 2px solid red !important;
          box-shadow: 0 0 8px rgba(255, 0, 0, 0.5) !important;
        }
        
        @keyframes parpadeo {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0.3; }
        }
        
        .parpadeo {
          animation: parpadeo 0.6s ease-in-out 3;
        }
      `}</style>
    </div>
  );
}
