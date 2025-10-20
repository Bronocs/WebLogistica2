import React from "react";
import styles from "../styles/ModalFactura.module.css";

export default function ModalFactura({ open, onClose, onSave, facturas, setFacturas }) {
  if (!open) return null;

  // Maneja el cambio de cada input
  const handleInputChange = (idx, valor) => {
    const nuevas = facturas.map((item, i) => i === idx ? valor : item);
    // Si el último ya tiene algo y editas ese, agrega uno más vacío
    if (
      idx === facturas.length - 1 &&
      valor.trim() !== ""
    ) {
      setFacturas([...nuevas, ""]);
    } else {
      // Borra extras vacíos si hay más de uno al final
      let filtradas = nuevas;
      while (
        filtradas.length > 1 &&
        filtradas[filtradas.length - 1].trim() === "" &&
        filtradas[filtradas.length - 2].trim() === ""
      ) {
        filtradas = filtradas.slice(0, -1);
      }
      setFacturas(filtradas);
    }
  };

  // Al guardar, solo envía las no vacías
  const handleGuardar = () => {
    const limpias = facturas.filter(f => f.trim() !== "");
    const resultado = limpias.join("-");
    onSave(resultado);
  };

  return (
    <div className={styles["modal-bg"]}>
      <div className={styles["modal-card"]}>
        <h3>Agregar Facturas</h3>
        {facturas.map((val, idx) => (
          <input
            key={idx}
            value={val}
            onChange={e => handleInputChange(idx, e.target.value)}
            placeholder={`Factura ${idx + 1}`}
            style={{marginBottom: 8}}
          />
        ))}
        <div style={{marginTop: '1rem'}}>
          <button onClick={handleGuardar}>Guardar</button>
          <button onClick={onClose} style={{marginLeft:8}}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}
