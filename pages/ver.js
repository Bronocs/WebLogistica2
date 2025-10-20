import { useEffect, useState } from 'react';
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import React from "react";
import ModalFactura from "../components/ModalFactura";

export default function VerOrdenes() {
  const router = useRouter();
  const [ordenes, setOrdenes] = useState([]);
  const [abierto, setAbierto] = useState(null);
  const [verEntregadas, setVerEntregadas] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [ocSeleccionada, setOcSeleccionada] = useState(null);
  const [nuevoEstado, setNuevoEstado] = useState(null);
  const [form, setForm] = useState({ nombre: "" });
  const [facturas, setFacturas] = useState([""]); // Siempre comienza como array
  const [loading, setLoading] = useState(false);
  const [exito, setExito] = useState(null); // para guardar el número de orden
  const [tipoCambio, setTipoCambio] = useState(null);

  const handleSave = () => {
    // Puedes usar datosDelModal si tu modal regresa info
    cambiarEstadoOC(ocSeleccionada, nuevoEstado);
    setShowModal(false);
    setFacturas([""]);
  };

  // 1. Función para traer órdenes
  const fetchOrdenes = async () => {
    const res = await fetch('/api/ver-ordenes');
    const data = await res.json();
    setOrdenes(data);
  };

  // 2. Al montar, cargamos las órdenes
  useEffect(() => {
    fetchOrdenes();
  }, []);

  // 3. Agrupar filas por número de orden
  const agrupado = {};
  ordenes.forEach(row => {
    const [numeroOrden, nombreProyecto, fecha, hora, nombre, unidad, cantidad, comentario, estado, fechaEntrega, facturas, confirmacion] = row;
    const estadoNorm = (estado || '').trim().toLowerCase();

    if (!agrupado[numeroOrden]) {
      agrupado[numeroOrden] = {
        proyecto: nombreProyecto,
        fecha,
        hora,
        estado: estadoNorm,
        fechaEntrega: fechaEntrega || '',
        productos: [],
        estado_confirmado: confirmacion
      };
    }
    agrupado[numeroOrden].productos.push({ nombre, unidad, cantidad, comentario, facturas});
  });

  const Editar_Pedido = (nroPedido) => {
    // Pasa el código como ruta dinámica y el tipo como query string
    router.push(`/editar_orden/${encodeURIComponent(nroPedido)}`);
  };

  const irAEnlace = () => {
    window.location.href = 'https://agua-mundo-definitivo.vercel.app/';
    // o window.open('https://ejemplo.com','_blank') para nueva pestaña
  };
  
  // 4. Convertir a lista y filtrar según entregadas/pendientes
  let listaOC = Object.entries(agrupado).filter(([, info]) =>
    verEntregadas
      ? info.estado === 'entregada'
      : info.estado !== 'entregada'
  );


  // 5. Ordenar por fecha+hora descendente (más recientes primero)
  listaOC.sort(([, aInfo], [, bInfo]) => {
    // aInfo.fecha = "19/6/2025", aInfo.hora = "18:22:07"
    const toTimestamp = (fecha, hora) => {
      // Convierte "19/6/2025" y "18:22:07" en Date
      const [d, m, y] = (fecha || '').split('/').map(Number);
      const [hh = 0, mm = 0, ss = 0] = (hora || '').split(':').map(Number);
      if (!y || !m || !d) return 0;
      return new Date(y, m - 1, d, hh, mm, ss).getTime();
    };
    return toTimestamp(bInfo.fecha, bInfo.hora) - toTimestamp(aInfo.fecha, aInfo.hora);
  });


  // 6. Cambiar estado de una orden y refrescar lista
  const cambiarEstadoOC = async (numeroOrden, nuevoEstado) => {
    setLoading(true);
    const resultado = facturas.join("-");
    const res = await fetch('/api/cambiar-estado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroOrden, nuevoEstado, resultado }),
    });
    setLoading(false);
    if (res.ok) {
      fetchOrdenes();
      setExito(nuevoEstado);
      setTipoCambio('entrega');
    } else {
      alert('Error actualizando estado');
    }
  };

  // 6. Cambiar estado de una orden y refrescar lista
  const confirmarOC = async (numeroOrden, estado_confirmar) => {
    setLoading(true);
    const resultado = facturas.join("-");
    const res = await fetch('/api/cambiar_estado_confirmado', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ numeroOrden, estado_confirmar}),
    });
    setLoading(false);
    if (res.ok) {
      fetchOrdenes();
      setExito(estado_confirmar);
      setTipoCambio('confirmacion');
    } else {
      alert('Error al confirmar pedido');
    }
  };

  return (
    
    <div className={styles.contenedor}>
      {loading && (
          <div className={styles.overlay}>
            <div className={styles.modal}>
              <div className={styles.spinner}></div>
              <p style={{ marginTop: 16 }}>Enviando...</p>
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
                {tipoCambio === 'confirmacion' ? `Pedido marcado como ${exito}` : `Pedido marcado como ${exito}`}<br />
                <span style={{ fontWeight: 400, fontSize: "15px" }}>
                  Número de Pedido: <b>{ocSeleccionada}</b>
                </span>
              </p>
              <button
                onClick={() => setExito(null)}
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
        <button type="button" className={`${styles.iconBtn2} ${styles.btnAtras2}`} onClick={() => window.location.href = '/'}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-house-door" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4z"/>
          </svg>
        </button>
        <h1 className={styles.btnLibre2}>Órdenes {verEntregadas ? 'Entregadas' : 'Pendientes'}</h1>
        <button className={`${styles.iconBtn2} ${styles.btnCerrar2}`} style={{ visibility: "hidden" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z"/>
          </svg>
        </button>
      </div>
      <button
        style={{
          marginBottom: '1rem',
          background: '#0074D9',
          color: 'white',
          padding: '0.6rem 1.5rem',
          borderRadius: '5px',
          border: 'none',
          cursor: 'pointer',
          fontWeight: 'bold'
        }}
        onClick={() => setVerEntregadas(v => !v)}
      >
        {verEntregadas ? 'Ver Pendientes' : 'Ver Entregadas'}
      </button>

      {listaOC.length === 0 ? (
        <p>Cargando...</p>
      ) : (
        listaOC.map(([oc, info], idx) => (
          <div
            className={styles.botones_pendientes}
            key={oc}
            style={{
              boxShadow: abierto === idx ? '0 2px 8px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            <button
              style={{
                width: '100%',
                padding: '1rem',
                fontWeight: 'bold',
                background: abierto === idx ? '#e8e8e8' : '#f8f8f8' ,
                border: info.estado_confirmado === 'confirmado'? '8px solid rgba(0, 255, 17, 1)': '8px solid rgba(255, 0, 0, 1)',
                textAlign: 'left',
                cursor: 'pointer',
                fontSize: '1.1rem'
              }}
              onClick={() => setAbierto(abierto === idx ? null : idx)}
            >
              <div>
                <strong>Número de Pedido:</strong> {oc} &nbsp;
              </div>
              <div>
                <strong>Referencia:</strong> {info.proyecto} &nbsp;
              </div>
              <div>
                <strong>Fecha registro:</strong> {info.fecha}
                &nbsp; <strong>Hora registro:</strong> {info.hora}
              </div>
              <span style={{ float: 'right' }}>
                {info.estado !== 'entregada' && (
                  <button
                  style={{
                    background: info.estado_confirmado === 'confirmado' ? '#f2ff00ff' : '#00ff11ff',
                    color: '#333',
                    border: 'none',
                    padding: '0.5rem',
                    margin: '0.5rem',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    marginLeft: '0.5rem'
                  }}
                  onClick={e => {
                      e.stopPropagation();
                      setOcSeleccionada(oc);
                      confirmarOC(oc, info.estado_confirmado === 'confirmado' ? 'pendiente' : 'confirmado');
                  }}
                  >
                  {info.estado_confirmado === 'confirmado'
                    ? 'Marcar como pendiente'
                    : 'Marcar como confirmado'}
                  </button> 
                )}                 
                <button
                  style={{
                  background: '#F7DC6F',
                  color: '#333',
                  border: 'none',
                  padding: '0.5rem',
                  margin: '1.5rem',
                  borderRadius: '4px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  marginLeft: '0.5rem'
                  }}
                  onClick={
                  () => Editar_Pedido(oc)
                  }
                  >
                  Editar
                </button>
              </span>
            </button>
            {abierto === idx && (
              <div style={{ padding: '1rem', borderTop: '1px solid #ddd', background: 'white' }}>
                <strong>Productos:</strong>
                <ul>
                  {info.productos.map((prod, i) => (
                    <li key={i} style={{ marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 500 }}>{prod.cantidad}</span>
                      {' - '}{prod.nombre} {prod.unidad}
                      {prod.comentario && (
                        <span style={{ color: '#888' }}> ({prod.comentario})</span>
                      )}
                    </li>
                  ))}
                </ul>
                {info.estado === 'entregada' && (
                  <div style={{ fontSize: '0.95em', color: '#333', marginTop: 6 }}>
                    <strong>Fecha de entrega:</strong> {info.fechaEntrega || 'Sin fecha'}
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
        <ModalFactura
          open={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          facturas={facturas}
          setFacturas={setFacturas}
        />
    </div>
  );
}
