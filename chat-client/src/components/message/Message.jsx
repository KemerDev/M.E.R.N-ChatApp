import { useContext } from "react"
import {format} from "timeago.js"
import { UserContext } from "../../context/userContext/userContext"
import './message.css'

export default function Message({conver, message}) {

    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const friends = JSON.parse(localStorage.getItem('friends'))
    const { user } = useContext(UserContext)

    return (
        <>  
            {!message.initMess ? 
            <div className={message.data.sender === user._id ? "messcontain own" : "messcontain"}>
                <div className="messtop">
                    <img src={friends.map(fr => fr === message.data.sender) && message.data.sender !== user._id 
                        ? PF + friends.map(fr => {
                            if (fr._id === message.data.sender) {
                                return fr.profilePic
                            }
                        }) : PF + user.profilePic} crossOrigin="anonymous" alt="" className="messimg" />
                    <p className="messtext">{message.data.text}</p>
                </div>
                <div className="messbot">{format(message.createdAt)}</div>
            </div>
            : undefined }
        </>
    )
    
}
