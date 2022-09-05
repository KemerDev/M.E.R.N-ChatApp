import React, { useContext, useEffect, useState } from "react"
import {BrowserRouter as Router,  Routes, Route, Navigate} from "react-router-dom"
import { AuthContext } from "./context/authContext/authContext"
import Register from "./pages/register/Register"
import Login from "./pages/login/Login"
import Home from "./pages/home/Home"
import Settings from "./pages/settings/Settings"
import Friends from "./pages/friends/Friends"


function App() {

  const { token } = useContext(AuthContext)

  return (
    <Router>
      <Routes>
        <Route exact path="/home" element={token ? <Home /> : <Navigate to="/login"/>}/>
        <Route path="/login" element={token ? <Navigate to="/home"/> : <Login/>}/>
        <Route path="/register" element={token ? <Navigate to="/home"/> : <Register/>}/>
        <Route path="/home" element={!token ? <Navigate to="/login"/> : <Home/>}/>
        <Route path="/settings" element={<Settings />}/>
        <Route path="/friends" element={<Friends />}/>
      </Routes>
    </Router>
  )
}

export default App;
