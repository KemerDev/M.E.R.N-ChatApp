import React,{useContext, useEffect, useState} from 'react'
import { useMediaQuery } from 'react-responsive'
import { AuthContext } from '../../context/authContext/authContext'
import { ConvContext } from '../../context/convContext/convContext'
import { MessContext } from '../../context/messContext/messContext'
import { FrienContext } from '../../context/frienContext/frienContext'
import { friendsCall, conversationsCall, messagesCall } from '../../apiCalls'
import Topbar from '../../components/topbar/Topbar'
import Conversation from '../../components/conversations/Conversation'
import BottomProfile from '../../components/bottomProfile/BottomProfile'
import MenuIcon from '@mui/icons-material/Menu'
import './home.css'

export default function Home({socket}) {
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

    const { token } = useContext(AuthContext)
    const { conversations, convDispatch } = useContext(ConvContext)
    const { messages, messDispatch } = useContext(MessContext)
    const { friends, frienDispatch } = useContext(FrienContext)

    const user = JSON.parse(localStorage.getItem('userData'))
    
    const [usersOnline, setUsersOnline] = useState([])
    const [conversation, setConversation] = useState()
    const [styleMobile, setStyleMobile] = useState("mainFriendsChatIn")

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
        socket.emit("userCon", user._id)
        socket.on("getUserCon", users => {
            setUsersOnline(
                friends?.filter((f) => 
                    users?.some((u) => u.userId !== f._id)))
        })
    }, [socket, user._id])

    const handleConv = (conv) => {
        setConversation(conv)
    }

    return (
        <>
            {friends ? <Topbar /> : null}
            
            <div className="mainContainer">
                <div className="mainWrap">
                    <div className="mainFriendsView">
                        <div className="mainFriendsViewWrap">
                            <span className='spanTopMes'>OPEN CHAT</span>
                            <div>
                                {
                                    friends ?
                                        <Conversation convHandle={handleConv} conversation={conversation}/>
                                        :
                                        null
                                }
                            </div>
                            <BottomProfile socket={socket} token={token}/>
                        </div>
                    </div>
                    {isMobile ?
                        <div className={styleMobile}>
                            <div className="mainFriendsChatWrapp">
                                <MenuIcon onClick={() => styleMobile === "mainFriendsChatIn" ? setStyleMobile("mainFriendsChat") : setStyleMobile("mainFriendsChatIn")} type="checkbox" className='menuBars' style={{fontSize: '30px'}}/>
                                {
                                    conversation ? null : <span>Click On A User To Open Chat</span>
                                }
                            </div>
                        </div>
                        :
                        <div className="mainFriendsChat">
                            <div className="mainFriendsChatWrapp">
                                {
                                    conversation ? null : <span>Click On A User To Open Chat</span>
                                }
                            </div>
                        </div>
                    }

                </div>
            </div>
        </>
    )
}
