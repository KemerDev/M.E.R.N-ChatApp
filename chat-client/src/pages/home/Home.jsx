import React,{useContext, useEffect, useState} from 'react'
import { useMediaQuery } from 'react-responsive'
import { UserContext} from '../../context/userContext/userContext'
import Topbar from '../../components/topbar/Topbar'
import Conversation from '../../components/conversations/Conversation'
import BottomProfile from '../../components/bottomProfile/BottomProfile'
import './home.css'
import MenuIcon from '@mui/icons-material/Menu'

export default function Home({socket}) {
    const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

    const {user} = useContext(UserContext)

    const friends = JSON.parse(localStorage.getItem('friends'))
    
    const [usersOnline, setUsersOnline] = useState([])
    const [conversation, setConversation] = useState()
    const [styleMobile, setStyleMobile] = useState("mainFriendsChatIn")

    useEffect(() => {
        socket.emit("userCon", user._id)
        socket.on("getUserCon", users => {
            setUsersOnline(
                friends.filter((f) => 
                    users.some((u) => u.userId !== f._id)))
        })
    }, [socket, user])

    const handleConv = (conv) => {
        setConversation(conv)
    }

    return (
        <>
            <Topbar />
            <div className="mainContainer">
                <div className="mainWrap">
                    <div className="mainFriendsView">
                        <div className="mainFriendsViewWrap">
                            <span className='spanTopMes'>OPEN CHAT</span>
                            <div>
                                <Conversation convHandle={handleConv} conversation={conversation}/>
                            </div>
                            <BottomProfile />
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
