import React,{useContext, useEffect, useState, useRef} from 'react'
import socket from '../../socket'
import { MessContext } from '../../context/messContext/messContext'
import Message from '../message/Message'
import './chat.css'

export default function Chat({conversation, usersOnline}) {
    const SPF = process.env.REACT_APP_PUBLIC_FOLDER_SOUNDS

    const { messages, messDispatch } = useContext(MessContext)

    const [socketGetMsg, setSocketGetMsg] = useState()

    const scrollBot = useRef(null)

    const currentChat = messages.find((ms) => {
        if (ms.conversationId !== conversation._id) {
            return ms
        }
    })

    useEffect(() => {
        socket.on('getMsg', content => {
            for (let i in usersOnline) {
                if (usersOnline[i].socketId === content.from) {
                    setSocketGetMsg({
                        initMess : content.initMess,
                        conversationId : content.conversationId,
                        read : content.read,
                        data : content.data,
                        createdAt : Date.now()
                    })
                }
            }
        })
    }, [])

    const audio = useRef(null)
    useEffect(() => {

        if (socketGetMsg) {
            try {
                audio.current?.play()
            } catch (err) {
                console.log(err)
            }
            for (let i in conversation) {
                if (socketGetMsg !== null && socketGetMsg.conversationId === conversation._id) {
                    for (let i in messages) {
                        if (messages[i][0].conversationId === conversation._id) {
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
        scrollBot.current?.scrollIntoView(true)
    }, [socketGetMsg])

    return (
        <>
            {socketGetMsg ? <audio ref={audio} src={SPF + "message_receive.mp3"} crossOrigin="anonymous" controls style={{display: 'none'}} /> : null}
            <div ref={scrollBot} className="chatMainCont">
                {
                    currentChat.map((msg) => <Message message={msg}/>)
                }
            </div>
        </>
    )
}