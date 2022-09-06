import React,{useState, useEffect} from 'react'
import { useNavigate, Link } from "react-router-dom"
import { axiosInstance } from '../../config'
import socket from '../../socket'
import SettingsIcon from '@mui/icons-material/Settings'
import {Person} from "@material-ui/icons"
import './bottomProfile.css'


export default function BottomProfile({token, usersOnline}) {
    const PF = process.env.REACT_APP_PUBLIC_FOLDER_IMAGES

    const user = JSON.parse(localStorage.getItem('userData'))
    const navigate = useNavigate()

    const DropdownItems = ({props, path}) => {
        const handleLogout = (e) => {
            e.preventDefault(e)

            const logoutUser = usersOnline.find(us => us.id === user._id)
            socket.emit("disc", {
                logoutUser
            })
            
            axiosInstance.post("/api/v1/users/logout/" + user._id,{
                headers: {authorization : "Bearer "+token}
            }).then((response) => {
                localStorage.clear()
                navigate("/login")
                window.location.reload(false)
            }).catch((error) => {
                console.log(error)
            })
        }

        return (
            <Link className="menuItemLeft" to={path} onClick={props === "Log out" ? handleLogout : undefined}>{props}</Link>
        )
    }

    const DropdownMenu = () => {
        return (
            <div className="dropdownLeft">
                <DropdownItems props="Profile" path="/home"/>
                <hr style={{margin:"2px 2%", color:"white"}}></hr>
                <DropdownItems props="Friends" path="/friends"/>
                <hr style={{margin:"2px 2%", color:"white"}}></hr>
                <DropdownItems props="Settings" path="/settings"/>
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
                <div className={"bottomActive"}></div>
                {open && props}
            </div>
        )
    }

    const FriendsIcon = () => {
        const [pendingAdds, setPendingAdds] = useState([])

        const makeReq = async () => {
            try {
                const res = await axiosInstance.get("/api/v1/users/getRequests/" + user._id, {
                    headers : {authorization : "Bearer "+token}
                })
    
                setPendingAdds(res.data)
    
            } catch (err) {
                console.log(err)
            }
        }

        useEffect(() => {
            makeReq()
        }, [])
    
        setInterval(makeReq, 120000)

        return (
            <>
                <div className="friendsIconContainer">
                    <Link to="/friends">
                        <Person className='friendsIcon'/>
                        <div className="friendNotif">
                            <span className="friendText">{pendingAdds.length}</span>
                        </div>
                        <div className="friendLez">
                            <span>Friends Pending</span>
                        </div>
                    </Link>
                </div>
            </>
        )
    }

    return (
    <div className="bottomProfile">
        <ProfileIcon props={<DropdownMenu/>}/>
        <span className='bottomUsername'>{user.username}</span>
        <FriendsIcon />
        <div className='settingsIconContainer'>
            <Link to="/settings">
                <SettingsIcon className='settingsIcon'/>
                <div className="settingsLez">
                    <span>Users</span>
                    <span>Setting</span>
                </div>
            </Link>
        </div>
    </div>
    )
}