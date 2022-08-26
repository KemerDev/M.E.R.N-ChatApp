import React, {useContext, useEffect, useState} from "react"
import { useNavigate } from "react-router-dom"
import { logincall } from "../../apiCalls"
import { AuthContext } from "../../context/authContext/authContext"
import {CircularProgress} from "@material-ui/core"
import "./login.css";


export default function Login() {

    const history = useNavigate()
    const {isFetch, error, dispatch} = useContext(AuthContext)

    const [values, setValues] = useState({Email : "", Password : ""})

    useEffect(() => {
        localStorage.clear()
    }, [])

    const handleChange = (e) => {
        setValues({ ...values, [e.target.name] : e.target.value})
    }

    const handleClick = (e) => {
        e.preventDefault()
        logincall(
            {
                Email:values.Email, 
                Password:values.Password
            }, 
                dispatch
            )
    }
    return (
        <div className="login-contain">
            <div className="login-wrapp">
                <div className="login-left">
                    <h3 className="login-logo">TextMe</h3>
                    <span className="login-desc">Make friends, chat with them</span>
                </div>
                <div className="login-right">
                    <form className="login-form" onSubmit={handleClick}>
                        <span className="cred-error">{error}</span>
                        <input placeholder="email" type="email" className="login-input" onChange={handleChange} value={values.Email} name="Email" required/>

                        <input placeholder="password" type="password" className="login-input" onChange={handleChange} value={values.Password} name="Password"  required/>

                        <button className="login-button" type="submit" disabled={isFetch} >{isFetch ? <CircularProgress color="white" size="20px"/> : "Log In"}</button>
                        <span className="login-forget">Forgot Password?</span>
                        <button className="login-register-button" onClick={() => history('/register')} >Register</button>
                    </form>
                </div>
            </div>
        </div>
    )
}
