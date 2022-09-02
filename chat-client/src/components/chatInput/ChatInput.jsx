import React,{useContext, useEffect, useState} from 'react'
import { axiosInstance } from '../../config'
import socket from '../../socket'
import { AuthContext } from '../../context/authContext/authContext'
import { MessContext } from '../../context/messContext/messContext'
import { FrienContext } from '../../context/frienContext/frienContext'

import './chatInput.css' 
  


export default function ChatInput({conversation, usersOnline}) {
    const { token } = useContext(AuthContext)
    const user = JSON.parse(localStorage.getItem('userData'))
    const { friends } = useContext(FrienContext)
    const { messages, messDispatch } = useContext(MessContext)

    const currentUser = friends.find((fr) => conversation.members.map((member) => fr._id !== member._id))

    const [send, setSend] = useState("")

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
            
            // παρε το id του ατομου που επικοινωνουμε
            const receiverId = currentUser._id
            
            // στειλε το αντικειμενο senderId, receiverId, text στον server

            usersOnline.some(us => us.userId === receiverId ?
                socket.emit("sendMsg", {
                    initMess : false,
                    conversationId : conversation._id,
                    read: false,
                    data : {
                        sender : user._id,
                        receiverId,
                        text: send,
                    },
                    to : us.socketId
                })
           : null )
    
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

    return (
        <>
            <div className="chatboxsend">
                <input className="chatinput" onKeyDown={e => e.key === 'Enter' ? handleSubmit(e, send) : ''} onChange={(e) => setSend(e.target.value)} value={send} placeholder={!send ? "Write to # "+currentUser.username : ""}></input>
                <button className="chatsend" onClick={e => {handleSubmit(e, send); setSend("")}}>Send</button>
            </div>
        </>
    )
}