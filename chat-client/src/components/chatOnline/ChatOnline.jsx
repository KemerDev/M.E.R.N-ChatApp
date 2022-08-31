import { useContext, useEffect, useState, useRef } from "react"
import { AuthContext } from "../../context/authContext/authContext"
import { ConvContext } from "../../context/convContext/convContext"
import { UserContext } from "../../context/userContext/userContext"
import { axiosInstance } from "../../config"


import './chatOnline.css'

export default function ChatOnline({usersOnline}) {

    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES

    //user context
    const {token} = useContext(AuthContext)
    const { user } = useContext(UserContext)
    const {conversations} = useContext(ConvContext)
    const friends = JSON.parse(localStorage.getItem('friends'))

    const [onlineFriends, setOnlineFriends] = useState([])

    const friendId = useRef("")

    useEffect(() => {
        console.log(friends)
        console.log(usersOnline)
    }, [])

    useEffect(() => {
        setOnlineFriends(usersOnline)
    }, [usersOnline])
    
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
                <span className='status'>OFFLINE -- | {friends.filter(x => !usersOnline.includes(x)).length} |</span>
                {friends.map((x) => !usersOnline.includes(x) ?
                    <div className="friend" onClick={((e) => handleClick(e, x?.username))}>
                        <div className="imgcont">
                            <img src={x?.profilePic ? PF + x?.profilePic : PF + "default.png"} crossOrigin="anonymous" className="img" alt="" />
                            <div className={"offsight"}></div>
                        </div>
                        <div className="text">{x?.username}</div>
                    </div>
                : null)}
            </div>
        </>
    )
}
