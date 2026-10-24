import { Routes, Route } from 'react-router-dom'
import Intro from './pages/Intro.jsx'
import SandboxPage from './pages/SandboxPage.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Intro />} />
      <Route path="/sandbox" element={<SandboxPage />} />
    </Routes>
  )
}

export default App