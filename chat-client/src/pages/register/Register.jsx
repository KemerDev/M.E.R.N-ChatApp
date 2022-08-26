import { React, useEffect, useState} from 'react'
import {useNavigate} from "react-router-dom"
import { axiosInstance } from '../../config'
import "./register.css"


export default function Register() {
    const navigate = useNavigate()

    const [formValues, setFormValues] = useState({Username : "", Email : "", Password : "", Password2 : ""})
    const [formErrors, setFormErrors] = useState({})

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        await axiosInstance.post("/api/v1/auth/register", formValues)
        /*.catch(function (err) {
            if (err.response.data) {
            }
                })*/
        navigate("/login")
    }

    const handleChange = (e) => {
        setFormValues({ ...formValues, [e.target.name] : e.target.value})
    }

    useEffect(() => {
        setFormErrors(client_validity(formValues))
    }, [formValues])

    const client_validity = (data) => {
        const err = {}
        const emailRegexCheck = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,100}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,100}[a-zA-Z0-9])?)*$/
        const pwdRegexCheck = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&.]{8,}$/
        const userRegexCheck = /^[a-zA-Z0-9]([._](?![._])|[a-zA-Z0-9]){6,18}[a-zA-Z0-9]*$/
        
        if (!userRegexCheck.test(data.Username)) {
            err.Username = "Username name must be bigger than 6 characters"
        }

        if(!emailRegexCheck.test(data.Email)) {
            err.Email = "Email is not valid"
        }

        if(!pwdRegexCheck.test(data.Password)) {
            err.Password = "Minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)"
        }

        if((data.Password === data.Password2) === false) {
            err.Password2 = "Passwords does not match"
        }

        return err
    }

    return (
        <div className="register-contain">
            <div className="register-wrapp">
                <div className="register-left">
                    <h3 className="register-logo">TextMe</h3>
                    <span className="register-desc">Make friends, chat with them</span>
                </div>
                <div className="register-right">
                    <form className="register-form" onSubmit={handleSubmit}>
                        <div className="register-input-cont">
                            <label>Username</label>
                            <input placeholder="Username" type="text" onChange={handleChange} value={formValues.Username} name="Username" className="register-input" />
                            <span>{formErrors.Username}</span>
                        </div>
                        <div className="register-input-cont">
                            <label>Email</label>
                            <input placeholder="email" type="email" onChange={handleChange} value={formValues.Email} name="Email" className="register-input" />
                            <span>{formErrors.Email}</span>
                        </div>
                        <div className="register-input-cont">
                            <label>Password</label>
                            <input placeholder="password" type="password" onChange={handleChange} value={formValues.Password} name="Password" className="register-input" />
                            <span>{formErrors.Password}</span>
                        </div>
                        <div className="register-input-cont">
                            <label>Confirm Password</label>
                            <input placeholder="confirm password" type="password" onChange={handleChange} value={formValues.Password2} name="Password2" className="register-input" />
                            <span>{formErrors.Password2}</span>
                        </div>
                        <button className="register-button" type="submit">Sign Up</button>
                        <button className="register-login-button" onClick={() => navigate('/login')}>Login</button>
                    </form>
                </div>
            </div>
        </div>
    )
}
