import React,{useContext, useState, useEffect, useRef} from 'react'
import { useMediaQuery } from 'react-responsive'
import Message from '../message/Message'
import Conversation from "../conversations/Conversation"
import ChatOnline from "../chatOnline/ChatOnline"
import BottomProfile from '../bottomProfile/BottomProfile'
import { AuthContext } from "../../context/authContext/authContext"
import { FriendContext } from "../../context/friendsContext/friendContext"
import { MessContext } from '../../context/messContext/messContext'
import { ConvContext } from '../../context/convContext/convContext'
import { UserContext } from '../../context/userContext/userContext'
import { axiosInstance } from '../../config'

import MenuIcon from '@mui/icons-material/Menu'
import TagIcon from '@mui/icons-material/Tag'

export default function Main({socket, usersOnline}) {

    const SPF = process.env.REACT_APP_PUBLIC_FOLDER_SOUNDS

    const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

    const [clickStyle, setClickStyle] = useState(true)
    const [centerStyle, setCenterStyle] = useState('centerMobile')
    const [botUserStyle, setBotUserStyle] = useState('chatLeftUserUp')

    // state για το αντικειμενο conversation που εχουμε κανει κλικ
    const [conversation, setConversation] = useState(null)

    const [currentChat, setCurrentChat] = useState(null)

    // state για να παρουμε το μηνυμα και να το στειλουμε
    // χρησιμοποιοντας το socket io
    const [socketGetMsg, setSocketGetMsg] = useState(null)

    //user context
    const { token } = useContext(AuthContext)
    const { user } = useContext(UserContext)
    const { friends } = useContext(FriendContext)
    const { messages, messDispatch} = useContext(MessContext)
    const { conversations } = useContext(ConvContext)
    const scrollBot = useRef(null)

    const multipleStatesStyle = (c_state, s_state, f_state) => {
        setClickStyle(f_state)
        setCenterStyle(c_state)
        setBotUserStyle(s_state)
    }

    const refreshPage = () => {
        localStorage.setItem("refresh", JSON.stringify(true))
        window.location.reload(true)
    }

    useEffect(() => {
        if (!JSON.parse(localStorage.getItem("refresh"))) {
            refreshPage()
        }
    }, [])
        
    useEffect(() => {
        // παρε το μηνυμα απο τον socket io server
        socket.on("getMsg", mess => {
            setSocketGetMsg({
                initMess : false,
                conversationId: mess.conversationId,
                read : mess.read,
                data : mess.data,
                createdAt: Date.now()
            })
        })
    }, [socket])

    const audio = useRef(null)
    useEffect(() => {

        if (socketGetMsg) {
            try {
                audio.current?.play()
            } catch (err) {
                console.log(err)
            }
            for (let i in conversations) {
                if (socketGetMsg !== null && socketGetMsg.conversationId === conversations[i]._id) {
                    for (let i in messages) {
                        if (messages[i][0].conversationId === conversations[i]._id) {
                            messages[i].push(socketGetMsg)
                            break
                        }
                    }

                    messDispatch({type:"MESS_UPDATE", payload: []})

                    messDispatch({type:"MESS_SUCCESS", payload: messages})
        
                } else {
                    for (let i in messages) {
                        if (messages[i][0]?.conversationId === socketGetMsg.conversationId) {
                            messages[i].push(socketGetMsg)
                            break
                        }
                    }
                }
            }
        }
    }, [socketGetMsg])

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
                    setCurrentChat(messages[i])
                }
    
                if (messages[i][0]?.conversationId === conversation._id) {
                    setCurrentChat(messages[i])
                }
            }
        }

    }, [conversation, setCurrentChat, socketGetMsg])

    // onClick μεθοδος η οποια αποσυνδεει τον χρηστη 
    // καθαριζει local storage και cookie
    
    const handleSubmit = async (e, send) => {
        e.preventDefault()

        if (send) {

            const new_msg = 
            {
                initMess : false,
                conversationId : conversation._id,
                read: false,

                data : {
                    sender : user._id,
                    text : send,
                }
                
            }
            
            // απο το array members παρε το id που δεν ειναι 
            // το δικο σου αλλα του αλλου που συνομιλεις
            const receiverId = conversation.members.find(
                (member)=>member!==user._id
            )
            
            // στειλε το αντικειμενο senderId, receiverId, text στον server

            if (usersOnline.some(user => user === receiverId)) {
                socket.emit("sendMsg", {
                    initMess : false,
                    conversationId : conversation._id,
                    read: false,
                    data : {
                        sender : user._id,
                        receiverId,
                        text: send,
                    }
                })
            }
    
            try {
                const res = await axiosInstance.post("/api/v1/messages", new_msg, {
                    headers: {authorization : "Bearer "+token}
                })

                for (let i in messages) {
                    if (messages[i][0].conversationId === conversation._id) {
                        messages[i].push(res.data)
                        break
                    }
                }

                messDispatch({type:"MESS_UPDATE", payload: []})

                messDispatch({type:"MESS_SUCCESS", payload: messages})

            } catch (err) {
                console.log(err.response)
            }
        }
    }

    const MessSend = ({userData}) => {
        // state για να περνουμε τα μηνυματα απο το textview
        const [send, setSend] = useState("")

        return (
            <div className="chatboxsend">
                {/*το onChange στο input tag προκαλει ολο την σελιδα να κανει re render, με αποτελεσμα
                να πεφτει δραματικα το performance της σελιδας */}
                    <input className="chatinput" onKeyDown={e => e.key === 'Enter' ? handleSubmit(e, send) : ''} onChange={(e) => setSend(e.target.value)} value={send} placeholder={!send ? "Write to # "+userData?.username : ""}></input>
                    <button className="chatsend" onClick={e => {handleSubmit(e, send); setSend("")}}>Send</button>
            </div>
        )
    }

    const handleConv = (conv) => {
        setConversation(conv)
    }

    useEffect(() => {
        scrollBot.current?.scrollIntoView(false)
    }, [messages, currentChat, socketGetMsg])

    return (
        <div className="mescontain">
            {socketGetMsg ? <audio ref={audio} src={SPF + "message_receive.mp3"} crossOrigin="anonymous" controls style={{display: 'none'}} /> : null}
            <div className="chatleft">
                <div className="chatmenuwrapp">
                    <span className='spanTopMes'>OPEN CHAT</span>
                    <div onClick={() => {setCenterStyle('chatcenter'); setBotUserStyle('chatLeftUser'); setClickStyle(false);}}>
                        <Conversation convHandle={handleConv} conversation={conversation}/>
                    </div>
                </div>
                <div className={isMobile ? botUserStyle : 'chatLeftUser'}>
                    <BottomProfile socket={socket} token={token} />
                </div>
            </div>
            <div className={isMobile ? centerStyle : 'chatcenter'}>
                <div className="chatboxwrapp">
                    <div className="mobileTopBar">
                        <MenuIcon className='menuBars'
                            onClick={() => !clickStyle ? multipleStatesStyle("centerMobile", "chatLeftUserUp", true) : multipleStatesStyle("chatcenter", "chatLeftUser", false)}/>
                            {friends.map((f) => (conversation?.members.map((c) => (f._id.includes(c) 
                                ? 
                                    <>
                                        <TagIcon className='mobiletopTagIcon'/>
                                        <span className='mobileTopBarName'>{f.username}</span>
                                    </>
                                : null
                            ))))}
                    </div>
                    { conversation ?
                    <>
                    <div className="chatboxincome">
                        <div ref={scrollBot}>
                            {currentChat?.map((m) => 
                                <Message conver={conversation} message={m}/>
                            )}
                        </div>
                    </div>
                    { friends.map((u) => (conversation.members.map((t) => (u._id.includes(t) ?
                        (<MessSend userData={u}/>)
                    :   null
                    ))))}
                    </> : <span className="noConv">Click a conversation to Chat</span>}
                </div>
            </div>
            <div className="chatright">
                <div className="chatonlinewrapp">
                    <ChatOnline usersOnline={usersOnline}/>
                </div>
            </div>
        </div>
    )
}