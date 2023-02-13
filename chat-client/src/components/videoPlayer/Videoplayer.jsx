import React,{ useContext, useState, useEffect } from "react"
import { CallContext } from "../../context/callContext/CallContext"
import './videoplayer.css'


export default function Videoplayer() {

    const { name, callAccept, callEnded, myVideo, userVideo, callStream, call} = useContext(CallContext)


    return (
        <>
            
            <div className="videoContainer">
                {callStream && (
                    <div className="videoMyContainer">
                        <video playsInline muted ref={myVideo} autoPlay/>
                    </div>
                )}

                {callAccept && !callEnded ? (
                    <div className="videoUserContainer" style={{display: "block"}}>
                        <video playsInline ref={userVideo} autoPlay/>
                    </div>
                ) : 
                    <div className="videoUserContainer">
                        <span>Calling User</span>
                    </div>
                }

            </div>
        </>
    )
}