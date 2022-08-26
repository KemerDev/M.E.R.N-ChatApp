import { useContext, useEffect, useState, useRef } from "react"
import {AuthContext} from "../../context/authContext/authContext"
import { FriendContext } from "../../context/friendsContext/friendContext"
import { ConvContext } from "../../context/convContext/convContext"
import { axiosInstance } from "../../config"
import jwt from 'jwt-decode'

import './chatOnline.css'

export default function ChatOnline({usersOnline}) {

    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES

    //user context
    const {token} = useContext(AuthContext)
    const {conversations} = useContext(ConvContext)
    const {friends} = useContext(FriendContext)

    const user = jwt(token)

    const [onlineFriends, setOnlineFriends] = useState([])
    const [offlineFriends, setOfflineFriends] = useState([])

    const friendId = useRef("")

    useEffect(() => {   

        const offline = []

        for(let i in friends) {
            if (!usersOnline.includes(friends[i]._id)) {
                offline.push(friends[i])
            }
        }

        setOfflineFriends(offline)
    }, [friends, usersOnline])

    useEffect(() => {   

        const online = []

        for(let i in friends) {
            if (usersOnline.includes(friends[i]._id)) {
                online.push(friends[i])
            }
        }

        setOnlineFriends(online)
    }, [friends, usersOnline])
    
    const handleClick = async (e, data) => {
        e.preventDefault()

        try {
            const res = await axiosInstance.get("/api/v1/users?username="+data, {
                headers : {authorization : "Bearer "+token}
            })

            friendId.current = res.data._id
        } catch(err) {
            console.log(err)
        }
        
        const convMembers = conversations.map((c) => (c.members))
        const exists = convMembers.find(item => item.includes(friendId.current))

        if (!exists) {
            try {
                await axiosInstance.post("/api/v1/conversations", {
                    senderId : user._id,
                    receiverId : friendId.current
                }, {
                    headers : {authorization : "Bearer "+token}
                    }
                )
                window.location.reload()
            } catch (err) {
                console.log(err)
            }
        }
    }

    useEffect(() => {

        const sendInit = async (msg) => {
            try {
                await axiosInstance.post("/api/v1/messages", msg, {
                    headers: {authorization : "Bearer "+token}
                })
            } catch (err) {
                console.log(err)
            }
        }

        const updateConvInit = async (convId) => {
            try {
                await axiosInstance.put("/api/v1/conversations/" + convId, {
                    initConv : false
                },
                {
                    headers: {authorization : "Bearer "+token}
                })
            } catch (err) {
                console.log(err)
            }
        }

        for (let i in conversations) {
            if (conversations[i].initConv === true) {

                const new_msg = {
                    initMess : true,
                    conversationId : conversations[i]._id,

                    data : {
                        sender : user._id,
                        text : "",
                        read : true,
                    }
                }

                sendInit(new_msg)
                updateConvInit(conversations[i]._id)
            }
        }
    }, [conversations])

    return (
        <>
            <div className="onContain">
                <span className='status'>ONLINE -- | {onlineFriends.length} |</span>
                {onlineFriends.map(o=> ( o ?
                    <div className="friend" onClick={((e) => handleClick(e, o?.username))}>
                        <div className="imgcont">
                            <img src={PF + o?.profilePic ? PF + o?.profilePic : PF + "default.png"} crossOrigin="anonymous" className="img" alt="" />
                            <div className={"sight"}></div>
                        </div>
                        <div className="text">{o?.username}</div>
                    </div>
                : null))}
            </div>

            <div className="offContain">
                <span className='status'>OFFLINE -- | {offlineFriends.length} |</span>
                {offlineFriends.map(o=> ( o ?
                    <div className="friend" onClick={((e) => handleClick(e, o?.username))}>
                        <div className="imgcont">
                            <img src={o?.profilePic ? PF + o?.profilePic : PF + "default.png"} crossOrigin="anonymous" className="img" alt="" />
                            <div className={"offsight"}></div>
                        </div>
                        <div className="text">{o?.username}</div>
                    </div>
                : null))}
            </div>
        </>
    )
}
