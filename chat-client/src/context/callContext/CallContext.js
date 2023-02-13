import React, {createContext, useEffect, useState, useRef} from 'react'
import socket from '../../socket'
import Peer from 'simple-peer'


export const CallContext = createContext()


export const CallContextProv = ({ children }) => {

    const [callStream, setCallStream] = useState(null)
    const [call, setCall] = useState({})
    const [myId, setMyId] = useState('')
    const [callAccept, setCallAccept] = useState(false)
    const [callEnded, setCallEnded] = useState(false)
    const [name, setName] = useState('')


    const myVideo = useRef({})
    const userVideo = useRef()
    const connectionRef = useRef()

    useEffect(() => {

        navigator.mediaDevices.getUserMedia({video:true, audio:true})
            .then((currentStream) => {
                setCallStream(currentStream)
                myVideo.current.srcObject = currentStream
            })

        socket.on('me', (id) => setMyId(id))

        socket.on('callUser', ({from, name: callerName, signal }) => {
            setCall({isReceivedCall : true, from, name : callerName, signal})
        })
    }, [])

    const answerCall = () => {
        setCallAccept(true)

        const peer = new Peer({initiator : false, trickle : false, callStream})

        peer.on('signal', (data) => {
            socket.emit('answerCall', {signal:data, to:call.from})
        })

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream
        })

        peer.signal(call.signal)

        connectionRef.current = peer
    }

    const callUser = (id) => {
        const peer = new Peer({initiator : true, trickle : false, callStream})

        peer.on('signal', (data) => {
            socket.emit('callUser', {userToCall:id, signalData: data, from:myId, name})
        })

        peer.on('stream', (currentStream) => {
            userVideo.current.srcObject = currentStream
        })

        socket.on('callAccept', (signal) => {
            setCallAccept(true)

            peer.signal(signal)
        })

        connectionRef.current = peer
    }

    const closeCall = () => {
        setCallEnded(true)

        connectionRef.current.destroy()

        window.location.reload()
    }

    return (
        <CallContext.Provider value={{
            call,
            callAccept,
            myVideo,
            userVideo,
            callStream,
            name,
            setName,
            callEnded,
            myId,
            callUser,
            answerCall,
            closeCall
        }}>
            {children}
        </CallContext.Provider>
    )
}