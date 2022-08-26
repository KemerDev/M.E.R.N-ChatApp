import React, { useContext, useEffect } from "react"
import {BrowserRouter as Router,  Routes, Route, Navigate} from "react-router-dom"
import {io} from "socket.io-client"
import { AuthContext } from "./context/authContext/authContext"
import { UserContext } from "./context/userContext/userContext"
import { FriendContext } from "./context/friendsContext/friendContext"
import { friendsCall } from './apiCalls'
import Register from "./pages/register/Register"
import Login from "./pages/login/Login"
import Home from "./pages/home/Home"
import Settings from "./pages/settings/Settings"
import jwt from 'jwt-decode'

function App() {
  const { token } = useContext(AuthContext)
  const { userDispatch } = useContext(UserContext)
  const { frieDispatch } = useContext(FriendContext)

  useEffect(() => {
    if (token && !localStorage.getItem("userLocal")) {
      userDispatch({type:'USER_START'})
  
      userDispatch({type:'USER_SUCCESS', payload: jwt(token)})
    }
  }, [token])
  
  useEffect(() => {
    if (token) {
      friendsCall (
        {
          dataId: jwt(token)._id,
          dataToken: token,
        },
        frieDispatch
      )
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route exact path="/" element={token ? <Home socket={io("ws://localhost:8800")}/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={token ? <Navigate to="/"/> : <Login/>}/>
        <Route path="/register" element={token ? <Navigate to="/"/> : <Register/>}/>
        <Route path="/" element={!token ? <Navigate to="/login"/> : <Home/>}/>
        <Route exact path="/settings" element={<Settings />}/>
      </Routes>
    </Router>
  )
}

export default App;
