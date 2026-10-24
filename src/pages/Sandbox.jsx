import SandboxCanvas from '../components/Sandbox.jsx'
import { createAtom, useSandboxAtoms } from '../logic/useSandboxAtoms.js'

// Začasni atomi, dokler ni drag & drop iz stranske vrstice (A3).
const demoAtoms = [
  createAtom('H', 120, 100),
  createAtom('O', 220, 160),
  createAtom('C', 340, 120),
  createAtom('N', 160, 260),
  createAtom('Cl', 300, 280),
  createAtom('Na', 440, 220),
]

function Sandbox() {
  const { atoms } = useSandboxAtoms(demoAtoms)

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="logo">Atomics</h1>
      </header>

      <main className="workspace">
        <SandboxCanvas atoms={atoms} />
      </main>
    </div>
  )
}

export default Sandbox
