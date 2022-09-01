import React, { useContext, useEffect, useState } from "react"
import {BrowserRouter as Router,  Routes, Route, Navigate} from "react-router-dom"
import {io} from "socket.io-client"
import { AuthContext } from "./context/authContext/authContext"
import Register from "./pages/register/Register"
import Login from "./pages/login/Login"
import Home from "./pages/home/Home"
import Settings from "./pages/settings/Settings"


function App() {

  const { token } = useContext(AuthContext)

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={token ? <Home socket={io("ws://localhost:8800")}/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={token ? <Navigate to="/"/> : <Login/>}/>
        <Route path="/register" element={token ? <Navigate to="/"/> : <Register/>}/>
        <Route path="/" element={!token ? <Navigate to="/login"/> : <Home/>}/>
        <Route path="/settings" element={<Settings />}/>
      </Routes>
    </Router>
  )
}

export default App;
