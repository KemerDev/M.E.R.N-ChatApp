import React,{useContext, useState, useEffect} from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { axiosInstance } from '../../config'
import jwt from 'jwt-decode'
import { AuthContext } from "../../context/authContext/authContext"
import { FriendContext } from "../../context/friendsContext/friendContext"
import { ConvContext } from '../../context/convContext/convContext'
import { MessContext } from '../../context/messContext/messContext'
import { PhotoContext } from '../../context/photosContext/photosContext'
import { conversationsCall, messagesCall, photoCall } from '../../apiCalls'
import Topbar from '../../components/topbar/Topbar'
import Main from '../../components/main/Main'
import './home.css'

export default function Home({socket}) {
    const {token} = useContext(AuthContext)
    const { friends } = useContext(FriendContext)
    const { conversations, convDispatch } = useContext(ConvContext)
    const { messDispatch } = useContext(MessContext)
    const {photoDispatch} = useContext(PhotoContext)
    const user = jwt(token)

    // state για το αμα οι χρηστες ειναι online 
    const [usersOnline, setUsersOnline] = useState([])

    useEffect(() => {
        photoCall (
            {
                friends: friends,
                user: jwt(token),
            },
            photoDispatch
        )
    }, [friends])

    useEffect(() => {
        if (token) {
          conversationsCall (
            {
              dataId: jwt(token)._id,
              dataToken: token,
            },
            convDispatch
          )
        }
      }, [])

    useEffect(() => {
        if (token) {
          messagesCall (
            {
                conver: conversations,
                dataToken: token,
            },
            messDispatch
          )
        }
    }, [conversations, messDispatch, token])


    useEffect(() => {
        socket.emit("userCon", user._id)
        socket.on("getUserCon", users => {
            setUsersOnline(
                user.friends.filter((f) => 
                    users.some((u) => u.userId === f)))
        })
    }, [socket, user._id])

    const refreshPage = setInterval(() => {
        window.location.reload(false)

        return () => clearInterval(refreshPage)
    }, 600000)

    const navigate = useNavigate()
    
    const disconnectErr = async () => {
        try {
            await axiosInstance.post("/api/v1/users/logout/"+user._id,{
                headers: {authorization : "Bearer "+token}
            })

            socket.emit("userDisconnect", user._id)
            localStorage.clear()
            navigate("/login")
            window.location.reload(false)
        } catch (err) {
            console.log(err.response)
        }
    }

    const check_expired = setInterval(async () => {
        let current_date = new Date()
        let current_seconds = Math.round(current_date.getTime() / 1000)

        if ((user.exp - 5) < current_seconds) {
            axiosInstance.post("/api/v1/users/refresh/" + user._id, "",{
                headers: {authorization : "Bearer "+token}
            }).then(res => {
                const taken_token = res.headers["x-auth"]
                const new_token = taken_token.split(" ")[1]
                localStorage.setItem("token", new_token)
                window.location.reload(false)
            }).catch (function (err) {
                disconnectErr()
            })
        }
        return () => clearInterval(check_expired)
    }, 1000)

    return (
        <>
            <Topbar user={user}/>
            <Main socket={socket} user={user} usersOnline={usersOnline}/>
        </>
    )
}
