import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import styles from '../../styles/oc-pasos.module.css'; // AJUSTA la ruta si tu archivo está en otro lugar

// --- PASOS_OC ---
const PASOS_OC = [
  {
    nombre: "Comprobar stock",
    fields: [
      { name: "stock", label: "¿Tenemos stock?", type: "select", options: ["Si", "No"], required: true }
    ]
  },
  {
    nombre: "Contactando con cliente o superior para información si es necesario",
    fields: [
      { name: "fecha_entrega_cliente", label: "¿Cuándo se le entregará al cliente?", required: true },
      { name: "horario_entrega_cliente", label: "¿En qué horario se le puede entregar al cliente?", required: true },
    ]
  },
  {
    nombre: "Contactando con superior",
    fields: [
      { name: "fecha_entrega_cliente", label: "¿Cuándo se le entregará al cliente?", required: true },
      { name: "horario_entrega_cliente", label: "¿En qué horario se le puede entregar al cliente?", required: true },
      { name: "tipo_suministro", label: "¿Recojo o recepción?", required: true },
      { name: "info_suministro", label: "Características principales del producto, importante para tomar buenas decisiones", required: false },
      { name: "lugar_almacenamiento", label: "¿Dónde se almacenará?", required: false }
    ]
  },
  {
    nombre: "Contactando con Logística",
    fields: [
      { name: "espacio_libre", label: "¿Hay espacio libre?", required: true },
      { name: "pendientes_logistica", label: "¿Logística está libre o cuándo se liberará?", required: true }
    ]
  },
  {
    nombre: "Contactando proveedores",
    fields: [],
    info: "Contacta con proveedores y conversa con superior, usa esta información relevante",
    mostrar: ["tipo_suministro", "fecha_entrega", "info_suministro", "espacio_libre", "pendientes_logistica"]
  },
  {
    nombre: "Cerrando trato con proveedor elegido",
    fields: [
      { name: "precio_suministro", label: "Precio total", required: true },
      { name: "ruc", label: "RUC", required: true },
      { name: "empaque_suministro", label: "¿Cómo está empacado el suministro?", required: true },
      { name: "cantidad_empaque", label: "¿Cuántos empaques vendrán?", required: true },
      { name: "peso_empaque", label: "¿Cuánto pesa cada empaque?", required: true },
      { name: "medidas_empaque", label: "¿Cuánto mide cada empaque?", required: true },
      { name: "medio_pago", label: "¿Qué métodos de pago tienen?", required: true },
      { name: "tipo_pago", label: "Tipo de pago", required: true, type: "select", options: ["Contado", "Crédito", "Otro"] },
      { name: "ubicacion_proveedor", label: "¿Dónde se recoge?", required: true },
      { name: "hora_abastecimiento", label: "Hora de recojo o recepción", required: true }
    ]
  },
  {
    nombre: "Elegir método de recojo o recepción de suministro",
    fields: [
      { name: "metodo_abastecimiento", label: "Método", required: true, type: "select", options: ["Recojo", "Recepción"] }
    ]
  },
  {
    nombre: "¿Requerimos transporte de terceros?",
    fields: [
      { name: "transporte_requerido", label: "Escoge", required: true, type: "select", options: ["Si", "No"] }
    ]
  },
  {
    nombre: "Coloca los datos del vehículo, contacta con logistica o con el transporte contratado",
    fields: [
      { name: "placa", label: "Placa del vehículo", required: true },
      { name: "licencia", label: "Licencia de conducir", required: true },
    ]
  },

  {
    nombre: "Haz la guía de remisión con los siguientes datos",
    fields: [],
    info: "Usa esta información para hacer la guía",
    mostrar: [
      "placa",
      "licencia",
      "peso_empaque",
      "ruc",
      "ubicacion_proveedor",
      "lugar_almacenamiento"
    ]
  },
  {
    nombre: "Informar estos datos a Logística",
    fields: [],
    info: "Usa esta información para informar a Logística",
    mostrar: [
      "fecha_entrega_cliente",
      "horario_entrega_cliente",
      "metodo_abastecimiento",
      "empaque_suministro",
      "cantidad_empaque",
      "peso_empaque",
      "medidas_empaque",
      "ubicacion_proveedor",
      "hora_abastecimiento"
    ]
  }
];

// Todos los nombres de variables en orden
const allFieldNames = Array.from(
  new Set(PASOS_OC.flatMap(p => p.fields ? p.fields.map(f => f.name) : []))
);

function getNextStep(currentStep, form) {
  if (currentStep === 0 && form.stock === "Si") return 1;
  if (currentStep === 1) return 8;
  if (currentStep === 0 && form.stock === "No") return 2;
  return currentStep + 1;
}

export default function OCPaso() {
  const router = useRouter();
  const { nombreOC } = router.query;

  const [form, setForm] = useState({});
  const [pasoActual, setPasoActual] = useState(0);
  const [touched, setTouched] = useState({});
  const [cargando, setCargando] = useState(true);
  const [loading, setLoading] = useState(false);

  // Cargar valores actuales
  useEffect(() => {
    if (!nombreOC) return;
    async function fetchData() {
      setCargando(true);
      const res = await fetch('/api/consultar_paso');
      const data = await res.json();
      const orden = data.find(row => (row[10] || "").toString() === nombreOC);
      if (!orden) {
        setCargando(false);
        setForm({});
        return;
      }
      setPasoActual(Number(orden[32]) || 0);
      // Cargar campos desde columna 33 en adelante
      const formData = {};
      allFieldNames.forEach((name, i) => {
        formData[name] = orden[33 + i] !== undefined ? orden[33 + i] : "";
      });
      setForm(formData);
      setCargando(false);
    }
    fetchData();
    // eslint-disable-next-line
  }, [nombreOC]);

  // ENVIAR PASO: primero el paso actual, luego todas las variables (en orden)
  const enviarPasoInfo = async (stepNumber, materialesFinal) => {
    setLoading(true);
    try {
      const datos = [stepNumber, ...allFieldNames.map(name => materialesFinal[name] || "")];
      await fetch('/api/guardar_paso', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paso_actual: stepNumber,
          datos,
          nombreOC
        }),
      });
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.error('Error al enviar:', err);
      alert('Error de conexión');
    }
  };

  if (cargando) {
    return (
      <div className={styles["oc-bg"]}>
        <div className={styles["oc-card"]}>
          <h2>Cargando orden de compra...</h2>
        </div>
      </div>
    );
  }

  if (pasoActual >= PASOS_OC.length) {
    return (
      <div className={styles["oc-bg"]}>
        <div className={styles["oc-card"]}>
          <h2>¡Orden de compra entregada con éxito!</h2>
        </div>
      </div>
    );
  }

  const paso = PASOS_OC[pasoActual];
  const isValid = paso.fields.every(
    f => !f.required || (form[f.name] && form[f.name].toString().trim() !== "")
  );

  const getLabel = (varName) =>
    PASOS_OC.flatMap(p => p.fields)
      .find(f => f.name === varName)?.label || varName;

  const handleChange = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (paso.fields.length > 0 && !isValid) return;

    const nextStep = getNextStep(pasoActual, form);

    await enviarPasoInfo(nextStep, form);

    setPasoActual(nextStep);
    setTouched({});
  };

  return (
    <div className={styles["oc-bg"]}>
      <div className={styles["oc-card"]}>
        <h2>Paso {pasoActual + 1}: {paso.nombre}</h2>
        <form onSubmit={handleSubmit} autoComplete="off">
          {paso.fields.length === 0 ? (
            <>
              {paso.info && (
                <div style={{ marginBottom: "1em", color: "#374151", fontSize: "1.1em" }}>
                  {paso.info}
                </div>
              )}
              {paso.mostrar && paso.mostrar.length > 0 && (
                <ul style={{ textAlign: "left", marginBottom: "2em" }}>
                  {paso.mostrar.map(varName => (
                    <li key={varName}>
                      <b>{getLabel(varName)}:</b>{" "}
                      {form[varName] || <span style={{ color: "#999" }}>No especificado</span>}
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles["oc-buttons"]}>
                <button type="submit" className={styles["oc-btn"]} disabled={loading}>
                  {pasoActual < PASOS_OC.length - 1 ? "Continuar" : "Finalizar"}
                </button>
              </div>
            </>
          ) : (
            <>
              {paso.info && (
                <div style={{ marginBottom: "1em", color: "#374151", fontSize: "1.05em" }}>
                  {paso.info}
                </div>
              )}
              {paso.fields.map(field => (
                <div key={field.name} className={styles["input-group"]}>
                  <label>
                    {field.label}
                    {field.required && <span className={styles["required"]}>*</span>}
                  </label>
                  {field.type === "select" ? (
                    <select
                      className={styles["oc-input"]}
                      value={form[field.name] || ""}
                      onChange={e => handleChange(field.name, e.target.value)}
                      required={field.required}
                      disabled={loading}
                    >
                      <option value="">Selecciona...</option>
                      {field.options.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={styles["oc-input"]}
                      type="text"
                      value={form[field.name] || ""}
                      onChange={e => handleChange(field.name, e.target.value)}
                      onBlur={() =>
                        setTouched(prev => ({ ...prev, [field.name]: true }))
                      }
                      required={field.required}
                      disabled={loading}
                    />
                  )}
                  {field.required &&
                    touched[field.name] &&
                    (!form[field.name] || form[field.name].trim() === "") && (
                      <div className={styles["input-error"]}>Campo obligatorio</div>
                    )}
                </div>
              ))}
              <div className={styles["oc-buttons"]}>
                <button
                  type="submit"
                  className={styles["oc-btn"]}
                  disabled={!isValid || loading}
                >
                  {pasoActual < PASOS_OC.length - 1 ? "Guardar y avanzar" : "Finalizar"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}