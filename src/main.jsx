import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { auth } from './firebase/config'

// Verificar conexión con Firebase
auth.onAuthStateChanged((user) => {
  console.log('Estado de autenticación:', user ? 'Usuario logueado' : 'No hay usuario');
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)