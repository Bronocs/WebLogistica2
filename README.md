# Proyecto de Portafolio: Gestión de Pedidos

Este proyecto es una aplicación web desarrollada con Next.js, diseñada para demostrar habilidades en desarrollo frontend, integración de APIs y gestión de datos. Simula un sistema de gestión de pedidos y stock, mostrando formularios interactivos, visualización de datos y validación del lado del cliente.

## Características

*   **Creación de Pedidos:** Los usuarios pueden crear nuevos pedidos especificando un nombre de proyecto y añadiendo múltiples productos con sus cantidades.
*   **Gestión de Stock:** Funcionalidad para visualizar y potencialmente editar los niveles de stock.
*   **Persistencia de Datos (Simulada):** Para propósitos de demostración, la API de backend simula el almacenamiento y la recuperación de datos, reemplazando la integración directa con servicios externos como Google Sheets. Esto permite que el proyecto se ejecute de forma independiente sin requerir claves API o credenciales externas.
*   **Validación del Lado del Cliente:** Una validación robusta asegura la integridad de los datos antes de su envío.
*   **Interfaz de Usuario Adaptable (Responsive UI):** Diseñada para ser accesible y funcional en diversos dispositivos.

## Tecnologías Utilizadas

*   **Next.js:** Framework de React para construir aplicaciones React renderizadas en el servidor.
*   **React:** Librería JavaScript para la construcción de interfaces de usuario.
*   **NextAuth.js:** Para autenticación (aunque no se explora completamente en este README, es parte de las dependencias del proyecto).
*   **Google APIs (Simuladas):** La integración original con Google Sheets para el almacenamiento de datos ha sido simulada para esta demostración de portafolio.
*   **CSS Modules:** Para un estilo con ámbito.
*   **JavaScript (ES6+):** Lenguaje principal para el desarrollo.

## Configuración y Ejecución Local

Para poner en marcha este proyecto en tu máquina local:

1.  **Clona el repositorio:**
    ```bash
    git clone <tu-url-del-repositorio>
    cd WebLogistica2
    ```
2.  **Instala las dependencias:**
    ```bash
    npm install
    ```
3.  **Ejecuta el servidor de desarrollo:**
    ```bash
    npm run dev
    ```
    Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación.

## Despliegue en Vercel

Este proyecto está diseñado para ser fácilmente desplegable en Vercel.

**Para una seguridad mejorada y una funcionalidad adecuada, especialmente si se integrara con servicios externos reales, se utilizan variables de entorno.**

Si integraras con una Google Sheet real (como lo hacía originalmente este proyecto), configurarías las siguientes variables de entorno directamente en la configuración de tu proyecto en Vercel (no en un archivo `.env` en tu repositorio):

*   `GOOGLE_CREDENTIALS`: El contenido de tu clave JSON de la Cuenta de Servicio de Google.
*   `SHEET_PEDIDOS_ID`: El ID de tu Google Sheet para pedidos.
*   `SHEET_PRODUCTOS_ID`: El ID de tu Google Sheet para productos.
*   `SHEET_RETAIL_ID`: El ID de tu Google Sheet para datos de ventas.
*   `SHEET_SKUS_ID`: El ID de tu Google Sheet para SKUs.
*   `NEXTAUTH_SECRET`: Una cadena secreta para NextAuth.
*   `NEXTAUTH_URL`: La URL pública de tu aplicación desplegada (ej. `https://tu-app.vercel.app`).

## Estructura del Proyecto

```
.
├── components/       # Componentes de UI reutilizables
├── pages/            # Páginas de Next.js y rutas de API
│   ├── api/          # Endpoints de la API de backend
│   └── ...           # Páginas frontend (index, agregar, ver, etc.)
├── public/           # Recursos estáticos (imágenes, etc.)
├── styles/           # Módulos CSS
├── utils/            # Funciones de utilidad
├── .gitignore        # Especifica archivos que Git debe ignorar
├── package.json      # Metadatos y dependencias del proyecto
└── README.md         # Resumen y documentación del proyecto
```

---