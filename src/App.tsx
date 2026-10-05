import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './Routes/AppRoutes'
import { Toaster } from 'react-hot-toast'
import AuthProvider from './Context/AuthProvider'
import GlobalProgressBar from './Components/GlobalProgressBar'

function App() {

  return (
    <>
      <div>
        <GlobalProgressBar />
        <Toaster />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </div>
    </>
  )
}

export default App
