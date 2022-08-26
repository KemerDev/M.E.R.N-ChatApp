import { useContext } from "react"
import {format} from "timeago.js"
import jwt from 'jwt-decode'
import { AuthContext } from "../../context/authContext/authContext"
import { PhotoContext } from '../../context/photosContext/photosContext'
import './message.css'

export default function Message({conver, message}) {

    const {token} = useContext(AuthContext)
    const {photos} = useContext(PhotoContext)

    const user = jwt(token)
    return (
        <>  
            {!message.initMess ? 
            <div className={message.data.sender === user._id ? "messcontain own" : "messcontain"}>
                <div className="messtop">
                    <img src={Object.keys(photos)?.includes(message.data.sender) && message.data.sender !== user._id 
                        ? photos[message.data.sender].profilePic : photos[user._id].profilePic} alt="" className="messimg" />
                    <p className="messtext">{message.data.text}</p>
                </div>
                <div className="messbot">{format(message.createdAt)}</div>
            </div>
            : undefined }
        </>
    )
    
}
