import { useContext } from 'react'
import { ConvContext } from '../../context/convContext/convContext'
import { FriendContext } from '../../context/friendsContext/friendContext'
import { MessContext } from '../../context/messContext/messContext'
import { UserContext } from '../../context/userContext/userContext'
import {Chat} from "@material-ui/icons"
import './conversation.css'

export default function Conversation({convHandle, conversation}) {
    
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES
    const BPF = process.env.REACT_APP_PUBLIC_FOLDER_BACKGROUND

    const { conversations } = useContext(ConvContext)
    const { friends } = useContext(FriendContext)
    const { messages } = useContext(MessContext)
    const { user } = useContext(UserContext)

    return (
        <>  
            {friends.map((u) => (conversations.map((con) => (con.members.map((t) => (u._id.includes(t) ?
                <div className="convcontain" onClick={() => convHandle(con)}>
                    <img src={BPF + u.coverPic} alt='' crossOrigin='anonymous' className='backImg' />
                    <img src={PF + u.profilePic}  alt='' crossOrigin='anonymous' className="convimg" />
                    <span className="convname">{u.username}</span>

                    <div className="convRightNotif">
                        <Chat className="RightNotif"/>

                        {con._id !== conversation?._id || conversation === null ? <span className="ItemNotifCount"><p>{
                            messages.map((m) => con._id === m[0]?.conversationId &&
                                m.filter(f => f.read === false && f.data.sender !== user._id).length
                            )
                        }</p></span> : undefined}
                    </div>
                </div>
                : null
            ))))))}
        </>
    )
}
