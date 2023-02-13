import React,{useContext, useEffect, useState, useRef} from 'react'
import socket from '../../socket'
import { MessContext } from '../../context/messContext/messContext'
import Message from '../message/Message'
import './chat.css'

export default function Chat({conversation, usersOnline}) {
    const SPF = process.env.REACT_APP_PUBLIC_FOLDER_SOUNDS

    const { messages, messDispatch } = useContext(MessContext)

    const [socketGetMsg, setSocketGetMsg] = useState()
    const [currentChat, setCurrentChat] = useState([])

    const scrollBot = useRef(null)

    socket.on('getMsg', content => {
        for (let i in usersOnline) {
            if (usersOnline[i].socketId === content.from) {
                setSocketGetMsg({
                    initMess : false,
                    conversationId : content.conversationId,
                    read : content.read,
                    data : content.data,
                    createdAt : Date.now()
                })
                break
            }
        }
    })

    useEffect(() => {
        for (let i in messages) {
            if (messages[i][0].conversationId === conversation._id) {
                setCurrentChat(messages[i])
                break
            }
        }
    }, [messages, conversation])

    const audio = useRef(null)
    useEffect(() => {

        if (socketGetMsg) {
            try {
                audio.current?.play()
            } catch (err) {
                console.log(err)
            }

            setCurrentChat((state) => [...state, socketGetMsg])
            /*for (let i in conversation) {
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
            }*/
        }
    }, [socketGetMsg])

    useEffect(() => {
        scrollBot.current?.scrollIntoView(false)
    }, [currentChat, socketGetMsg])

    return (
        <>
            {socketGetMsg ? <audio ref={audio} src={SPF + "message_receive.mp3"} crossOrigin="anonymous" controls style={{display: 'none'}} /> : null}
            <div className="chatMainCont">
                <div ref={scrollBot}>
                    {
                        currentChat.map((mes) => 
                            <Message message={mes}/>)
                    }
                </div>
            </div>
        </>
    )
}