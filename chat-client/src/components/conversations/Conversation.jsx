import { useContext } from 'react'
import { ConvContext } from '../../context/convContext/convContext'
import { MessContext } from '../../context/messContext/messContext'
import { FrienContext } from '../../context/frienContext/frienContext'
import {Chat} from "@material-ui/icons"
import { decrypt } from "../../cryptor"
import './conversation.css'

export default function Conversation({convHandle, conversation, usersOnline}) {
    
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const BPF = process.env.REACT_APP_PUBLIC_FOLDER_BACKGROUND

    const { conversations } = useContext(ConvContext)
    const { messages } = useContext(MessContext)
    const {friends} = useContext(FrienContext)

    const user = JSON.parse(decrypt(localStorage.getItem('userData')))

    return (
        <>  
            {friends.map((u) => (conversations.map((con) => (con.members.map((t) => (u._id.includes(t) ?
                <div className="convcontain" onClick={() => convHandle(con)}>
                    <img src={BPF + u.coverPic} alt='' crossOrigin='anonymous' className='backImg' />
                    <img src={PF + u.profilePic}  alt='' crossOrigin='anonymous' className="convimg" />
                    {usersOnline.length > 0 ? 
                        usersOnline.map((on) => on.userId === u._id ? 
                            <div className={"convActive"}></div>
                            :
                            <div className={"convInActive"}></div>
                        )
                        : 
                        <div className={"convInActive"}></div>
                    }
                    <span className="convname">{u.username}</span>

                    <div className="convRightNotif">
                        <Chat className="RightNotif"/>

                        {con._id !== conversation?._id || conversation === null ? <span className="ItemNotifCount"><p>{
                            messages.map((m) => con._id === m[0]?.conversationId &&
                                m.filter(f => f.read === false && f.data.sender !== user._id).length
                            )
                        }</p></span> : <span className="ItemNotifCount"><p>0</p></span>}
                    </div>
                </div>
                : null
            ))))))}
        </>
    )
}
