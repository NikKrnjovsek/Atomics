import './App.css'

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">Atomics</h1>
      </header>

      <main className="workspace">
        <section className="sandbox" aria-label="Platno za sestavljanje atomov">
          <p className="sandbox-hint">Sem povleci atome</p>
        </section>
      </main>
    </div>
  )
}

export default App
