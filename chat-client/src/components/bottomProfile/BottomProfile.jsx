import React,{useContext, useState} from 'react'
import { useNavigate, Link } from "react-router-dom"
import { UserContext } from "../../context/userContext/userContext"
import { axiosInstance } from '../../config'
import SettingsIcon from '@mui/icons-material/Settings'
import './bottomProfile.css'


export default function BottomProfile({socket, token}) {
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES

    const { user } = useContext(UserContext)

    const navigate = useNavigate()

    const DropdownItems = ({props, path}) => {
        const handleLogout = async (e) => {
            e.preventDefault(e)
    
            try {
                await axiosInstance.post("/api/v1/users/logout/" + user._id,{
                    headers: {authorization : "Bearer "+token}
                })
                socket.emit("userDisconnect", user._id)
                localStorage.clear()
                navigate("/login")
            } catch (err) {
                console.log(err.response)
            }
        }

        return (
            <Link className="menuItemLeft" to={path} onClick={props === "Log out" ? handleLogout : undefined}>{props}</Link>
        )
    }

    const DropdownMenu = () => {
        return (
            <div className="dropdownLeft">
                <DropdownItems props="Profile" path="/"/>
                <hr style={{margin:"2px 2%", color:"white"}}></hr>
                <DropdownItems props="Log out" path="/login"/>
            </div>
        )
    }

    const ProfileIcon = ({props}) => {
        const [open, setOpen] = useState(false)
        return (
            <div>
                <img src={PF + user.profilePic} onClick={() => setOpen(!open)} crossOrigin="anonymous" alt="" className="bottomImg" />
                {open && props}
            </div>
        )
    }

    return (
        <div className="bottomProfile">
        <ProfileIcon props={<DropdownMenu/>}/>
        <span className='bottomUsername'>{user.username}</span>
        <div className='settingsIconContainer'>
            <Link to="/settings">
                <SettingsIcon className='settingsIcon'/>
            </Link>
        </div>
    </div>
    )
}