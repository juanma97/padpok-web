import React from 'react'

export default function HomePage() {
  return (
    <div className="home-page">
      <header className="header">
        <h1>Bienvenido a Padpok Web App</h1>
        <p>Una aplicación web desarrollada con Next.js, React y TypeScript</p>
      </header>

      <section className="content">
        <div className="card">
          <h2>Características</h2>
          <ul>
            <li>⚛️ React.js para la interfaz de usuario</li>
            <li>🔥 Next.js para el backend y SSR</li>
            <li>🎨 CSS puro para estilos</li>
            <li>📘 TypeScript para tipado estático</li>
            <li>🏗️ Arquitectura DDD (Domain Driven Design)</li>
          </ul>
        </div>

        <div className="card">
          <h2>Estructura del Proyecto</h2>
          <ul>
            <li><strong>Domain:</strong> Lógica de negocio y entidades</li>
            <li><strong>Application:</strong> Casos de uso y servicios</li>
            <li><strong>Infrastructure:</strong> APIs, base de datos, almacenamiento</li>
            <li><strong>Shared:</strong> Utilidades y componentes compartidos</li>
          </ul>
        </div>
      </section>
    </div>
  )
}
