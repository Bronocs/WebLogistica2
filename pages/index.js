// pages/index.js

import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from 'next/link';
import styles from '../styles/Home.module.css';
import Head from "next/head";

export default function Home() {

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    
    <div className={styles.contenedor}>
      <img
        src="/logoAMalta.png"
        alt="Logo Agua Mundo"
        className={styles.logo}
      />
      <div className={styles.primerCuadro}>
        <h1>Pedidos para Proyectos</h1>  
            <div className={styles.botones}>
              <Link href="/agregar">
                <button  style={{
                    background : '#005bb8',
                    color: '#ffff'
                  }}>
                  <div className={styles.botonIndex}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 448 512"><path fill="#ffff" d="M256 64c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 160-160 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l160 0 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32l0-160 160 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-160 0 0-160z"/></svg>
                    Crear Pedido
                  </div>
                </button>
              </Link>
              <Link href="/ver">
                <button style={{
                    border : '1px solid #000000',
                    background: '#ffff',
                  }}>
                  <div className={styles.botonIndex}>
                    <svg xmlns="http://www.w3.org/2000/svg" width = "25" height = "25 "viewBox="0 0 640 640"><path d="M192 64C156.7 64 128 92.7 128 128L128 512C128 547.3 156.7 576 192 576L448 576C483.3 576 512 547.3 512 512L512 234.5C512 217.5 505.3 201.2 493.3 189.2L386.7 82.7C374.7 70.7 358.5 64 341.5 64L192 64zM453.5 240L360 240C346.7 240 336 229.3 336 216L336 122.5L453.5 240z"/></svg>
                    Ver Pedidos
                  </div>
                </button>
              </Link>
            </div>
      </div>
      <div className={styles.primerCuadro}>
        <h1>Gestión de Stock</h1>  
            <div className={styles.botones}>
              <Link href="/ver_stock">
                <button  style={{
                    background : '#ffa32bf4',
                    color: '#ffff'
                  }}>
                  <div className={styles.botonIndex}>
                    <svg xmlns="http://www.w3.org/2000/svg" width = "25" height = "25 " viewBox="0 0 640 640"><path fill="#ffff" d="M288 64L288 128C288 136.8 295.2 144 304 144L336 144C344.8 144 352 136.8 352 128L352 64L384 64C419.3 64 448 92.7 448 128L448 256C448 261.5 447.3 266.9 446 272L194 272C192.7 266.9 192 261.5 192 256L192 128C192 92.7 220.7 64 256 64L288 64zM384 576C372.8 576 362.2 573.1 353 568C362.5 551.5 368 532.4 368 512L368 384C368 363.6 362.5 344.5 353 328C362.2 322.9 372.7 320 384 320L416 320L416 384C416 392.8 423.2 400 432 400L464 400C472.8 400 480 392.8 480 384L480 320L512 320C547.3 320 576 348.7 576 384L576 512C576 547.3 547.3 576 512 576L384 576zM64 384C64 348.7 92.7 320 128 320L160 320L160 384C160 392.8 167.2 400 176 400L208 400C216.8 400 224 392.8 224 384L224 320L256 320C291.3 320 320 348.7 320 384L320 512C320 547.3 291.3 576 256 576L128 576C92.7 576 64 547.3 64 512L64 384z"/></svg>
                    Ver Stock
                  </div>
                </button>
              </Link>
              <Link href="/registrarIO">
                <button style={{
                    background: '#049c5c',
                    color: '#ffff'
                  }}>
                  <div className={styles.botonIndex}>
                    <svg xmlns="http://www.w3.org/2000/svg" width = "25" height = "25 " viewBox="0 0 640 640"><path fill="#ffff" d="M342.6 73.4C330.1 60.9 309.8 60.9 297.3 73.4L169.3 201.4C156.8 213.9 156.8 234.2 169.3 246.7C181.8 259.2 202.1 259.2 214.6 246.7L288 173.3L288 384C288 401.7 302.3 416 320 416C337.7 416 352 401.7 352 384L352 173.3L425.4 246.7C437.9 259.2 458.2 259.2 470.7 246.7C483.2 234.2 483.2 213.9 470.7 201.4L342.7 73.4zM160 416C160 398.3 145.7 384 128 384C110.3 384 96 398.3 96 416L96 480C96 533 139 576 192 576L448 576C501 576 544 533 544 480L544 416C544 398.3 529.7 384 512 384C494.3 384 480 398.3 480 416L480 480C480 497.7 465.7 512 448 512L192 512C174.3 512 160 497.7 160 480L160 416z"/></svg>
                    Editar Stock
                  </div>
                </button>
              </Link>
            </div>
      </div>
    </div>
  );
}
