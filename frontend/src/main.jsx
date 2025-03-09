import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import './index.css'
import App from './App.jsx'
import Dashboard from './pages/Dashboard.jsx'
import FinancialSentimentDashboard from './pages/FinancialSentimentDashboard';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Router>
      <Routes>
        <Route path='/' element={<App/>}/>
        <Route path='/dashboard' element={<Dashboard/>}/>
        <Route path='/news' element={<FinancialSentimentDashboard/>}/>
      </Routes>
    </Router>
  </StrictMode>
)
