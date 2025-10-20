import { getProviders, signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function SignIn({ providers }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/"); // Redirige al home si ya hay sesión
    }
  }, [status, router]);

  if (!providers) {
    return (
      <div className="signin-bg">
        <div className="signin-card">
          <p>No hay proveedores de login configurados.</p>
        </div>
        <style jsx>{`
          .signin-bg {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          }
          .signin-card {
            background: #fff;
            padding: 2.5rem 2rem;
            border-radius: 1.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            min-width: 320px;
            text-align: center;
            font-size: 1.15rem;
            color: #3a4a5d;
            font-weight: 500;
          }
        `}</style>
      </div>
    );
  }

  // Puedes mostrar un loading mientras status es "loading"
  if (status === "loading") {
    return (
      <div className="signin-bg">
        <div className="signin-card">
          <div className="loader"></div>
          <div style={{marginTop: "16px"}}>Cargando...</div>
        </div>
        <style jsx>{`
          .signin-bg {
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
          }
          .signin-card {
            background: #fff;
            padding: 2.5rem 2rem;
            border-radius: 1.5rem;
            box-shadow: 0 8px 32px rgba(0,0,0,0.12);
            min-width: 320px;
            text-align: center;
            font-size: 1.15rem;
            color: #3a4a5d;
            font-weight: 500;
          }
          .loader {
            border: 4px solid #3b82f6;
            border-top: 4px solid #e0eafc;
            border-radius: 50%;
            width: 36px;
            height: 36px;
            animation: spin 0.9s linear infinite;
            margin: 0 auto;
          }
          @keyframes spin {
            to { transform: rotate(360deg);}
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="signin-bg">
      <div className="signin-card">
        <h2>Inicia sesión para continuar</h2>
        {Object.values(providers).map(provider => (
          <div key={provider.name}>
            <button
              className="signin-btn"
              onClick={() => signIn(provider.id)}
            >
              Iniciar sesión con {provider.name}
            </button>
          </div>
        ))}
      </div>
      <style jsx>{`
        .signin-bg {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
        }
        .signin-card {
          background: #fff;
          padding: 2.5rem 2rem;
          border-radius: 1.5rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.12);
          min-width: 320px;
          text-align: center;
        }
        .signin-card h2 {
          font-size: 1.5rem;
          font-weight: bold;
          margin-bottom: 2rem;
          color: #2563eb;
        }
        .signin-btn {
          width: 100%;
          background: #2563eb;
          color: #fff;
          border: none;
          border-radius: 0.75rem;
          padding: 1rem 0;
          font-size: 1.15rem;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(37,99,235,0.08);
          margin-bottom: 1rem;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .signin-btn:hover {
          background: #1d4ed8;
          transform: translateY(-2px) scale(1.025);
        }
      `}</style>
    </div>
  );
}

// Next.js SSR para cargar providers
export async function getServerSideProps() {
  const providers = await getProviders();
  return {
    props: { providers: providers ?? {} },
  };
}
