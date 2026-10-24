import { Routes, Route } from 'react-router-dom'
import Intro from './pages/Intro.jsx'
import Sandbox from './pages/Sandbox.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/sandbox" element={<Sandbox />} />
    </Routes>
  )
}

export default App
