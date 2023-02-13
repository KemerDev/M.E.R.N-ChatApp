import { useContext } from "react"
import {format} from "timeago.js"
import { FrienContext } from "../../context/frienContext/frienContext"
import { decrypt } from "../../cryptor"
import './message.css'

export default function Message({message}) {

    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const user = JSON.parse(decrypt(localStorage.getItem('userData')))
    const { friends } = useContext(FrienContext)

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
                        }).join("") : PF + user.profilePic} crossOrigin="anonymous" alt="" className="messimg" />
                    <p className="messtext">{message.data.text}</p>
                </div>
                <div className="messbot">{format(message.createdAt)}</div>
            </div>
            : undefined }
        </>
    )
    
}
