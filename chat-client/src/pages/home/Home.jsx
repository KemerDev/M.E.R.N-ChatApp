import React,{useContext, useEffect, useState} from 'react'
import { useNavigate } from "react-router-dom"
import { useMediaQuery } from 'react-responsive'
import { AuthContext } from '../../context/authContext/authContext'
import { ConvContext } from '../../context/convContext/convContext'
import { MessContext } from '../../context/messContext/messContext'
import { FrienContext } from '../../context/frienContext/frienContext'
import { friendsCall, conversationsCall, messagesCall } from '../../apiCalls'
import { axiosInstance } from '../../config'
import socket from '../../socket'
import Topbar from '../../components/topbar/Topbar'
import Conversation from '../../components/conversations/Conversation'
import BottomProfile from '../../components/bottomProfile/BottomProfile'
import ChatInput from '../../components/chatInput/ChatInput'
import Chat from '../../components/chat/Chat'
import Videoplayer from '../../components/videoPlayer/Videoplayer'
import VideoCallIcon from '@mui/icons-material/VideoCall'
import MenuIcon from '@mui/icons-material/Menu'
import jwt from 'jwt-decode'
import { decrypt, encrypt } from '../../cryptor'
import './home.css'

export default function Home() {
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

    const { token, dispatch } = useContext(AuthContext)
    const { conversations, convDispatch } = useContext(ConvContext)
    const { messages, messDispatch } = useContext(MessContext)
    const { friends, frienDispatch } = useContext(FrienContext)

    const user = JSON.parse(decrypt(localStorage.getItem('userData')))
    
    const [conversation, setConversation] = useState()
    const [styleMobile, setStyleMobile] = useState("mainFriendsChatIn")
    const [usersOnline, setUsersOnline] = useState([])
    const [videoOpen, setVideoOpen] = useState(false)

    const navigate = useNavigate()
    
    const disconnectErr = async () => {
        const logoutUser = usersOnline.find(us => us.id === user._id)
        try {
            await axiosInstance.post("/api/v1/users/logout/"+user._id,{
                headers: {authorization : "Bearer "+token}
            })

            socket.emit("disc", {
                logoutUser
            })
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

        if (user.exp < current_seconds) {
            axiosInstance.post("/api/v1/users/refresh/"+user._id, "",
            ).then(res => {
                const new_token = res.headers["x-auth"].split(" ")[1]
                
                localStorage.setItem('userData', encrypt(jwt(decrypt(new_token))))
                dispatch({ type:"LOGIN_SUCCESS" , payload:new_token})
                window.location.reload(false)
            }).catch (err => {
                console.log(err)
            })
        }
        return () => clearInterval(check_expired)
    }, 1000)

    // socket authorize and connect
    useEffect(() => {
        socket.auth = {"userId" : user._id}
        socket.connect()
    }, [])

    useEffect(() => {
        socket.on("users", users => {
            setUsersOnline(users.filter(us => us.userId !== user._id))
        })
    }, [])

    useEffect(() => {
        if (token) {
            friendsCall (
            {
                dataId: user._id,
                dataToken: token,
            },
            frienDispatch
            )
        }
    }, [token, user._id])

    useEffect(() => {
        if (token) {
            conversationsCall (
            {
                dataId: user._id,
                dataToken: token,
            },
            convDispatch
            )
        }
    }, [token, user._id])

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
    }, [token, conversations])


    useEffect(() => {
        // μηνυμα διαβαστηκε
        const messRead = async (convId, senderId) => {
            await axiosInstance.put("/api/v1/messages/" + convId, {
                "read" : false,
                "sender" : senderId
            },{
                headers: {authorization : "Bearer "+token}
            })
        }

        if (conversation) {
            for (let i in messages) {
                if (messages[i][0]?.conversationId === conversation._id && messages[i].filter(m => m.read === false).length > 0) {
                    for (let j in messages[i]) {
                        messages[i][j].read = true
                    }
    
                    for (let k in messages[i]) {
                        if (messages[i][k].data.sender !== user._id) {
                            try {
                                messRead(conversation._id, messages[i][k].data.sender)
                                break
                            } catch (err) {
                                console.log(err)
                            }
                        }
                    }
                }
            }
        }

    }, [conversation])

    const handleConv = (conv) => {
        setConversation(conv)
        setStyleMobile("mainFriendsChat")
    }

    return (
        <>
            {friends ? <Topbar /> : null}
            
            <div className="mainContainer">
                <div className="mainWrap">
                    {videoOpen ? <Videoplayer /> : null}
                    <div className="mainFriendsView">
                        <div className="mainFriendsViewWrap">
                            <span className='spanTopMes'>OPEN CHAT</span>
                            <div>
                                {
                                    friends ?
                                        <Conversation convHandle={handleConv} conversation={conversation} usersOnline={usersOnline}/>
                                        :
                                        null
                                }
                            </div>
                            <BottomProfile token={token} usersOnline={usersOnline}/>
                        </div>
                    </div>
                    {isMobile ?
                        <div className={styleMobile}>
                            <div className="mainFriendsChatWrapp">
                                <div className="mainFriendsChatProps">
                                    <MenuIcon onClick={() => styleMobile === "mainFriendsChatIn" ? setStyleMobile("mainFriendsChat") : setStyleMobile("mainFriendsChatIn")} className='menuBars' style={{fontSize: '30px'}}/>
                                    {friends.map((fr) => conversation?.members.map((cn) => fr._id.includes(cn) ?     
                                        <span>@{fr.username}</span> : null
                                    ))}
                                </div>
                                {
                                    conversation ? 
                                        <>
                                                    <Chat conversation={conversation} usersOnline={usersOnline}/>
                                                    <ChatInput conversation={conversation} usersOnline={usersOnline}/>
                                        </>
                                     : <span>Click On A User To Open Chat</span>
                                }
                            </div>
                        </div>
                        :
                        <div className="mainFriendsChat">
                            <div className="mainFriendsChatWrapp">
                                <div className="mainFriendsChatProps">
                                    {friends.map((fr) => conversation?.members.map((cn) => fr._id.includes(cn) ?     
                                        <span>@{fr.username}</span> : null
                                    ))}
                                    {conversation ? <VideoCallIcon className='callIconProp' onClick={() => setVideoOpen(true)}/> : null}
                                </div>
                                {
                                    conversation ? 
                                        <>
                                            <Chat conversation={conversation} usersOnline={usersOnline}/> 
                                            <ChatInput conversation={conversation} usersOnline={usersOnline}/>
                                        </>
                                        : <span>Click On A User To Open Chat</span>
                                }
                            </div>
                        </div>
                    }

                </div>
            </div>
        </>
    )
}
