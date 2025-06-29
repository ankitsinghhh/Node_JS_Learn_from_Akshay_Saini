import axios from 'axios';
import React from 'react'
import {useState} from "react"
import { useDispatch } from 'react-redux';
import { addUser } from '../utils/userSlice';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';


const Login = () => {
    const [email,setEmailId] = useState("");
    const [password,setPassword] = useState("Strong#1234");
    const [firstName,setFirstName] = useState("")
    const [lastName,setLastName] = useState("")
    const [isLoginForm,setIsLoginForm] = useState(true)
    const [error,setError] = useState("")
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogin = async () =>{  
    
       try{
        const res = await axios.post(
            BASE_URL+"/login",
            {
                email,
                password,
            },
            { withCredentials:true}
    )

        console.log(res.data.data) 
        dispatch(addUser(res?.data?.data))
        return navigate('/')

       }
       catch(err){
            setError(err?.response?.data || "something went wrong")
            console.error(err)
       }
    }

    const handleSignUp = async () =>{
      try {
        const res = await axios.post(
          BASE_URL+"/signup",
          {
            firstName,
            lastName,
            email,
            password,
          },
          {withCredentials:true}
        )
        dispatch(addUser(res?.data?.data))
        return navigate('/profile')
      } catch (error) {
        setError(error?.response?.data || "something went wrong")
        console.error(error)
      }
    }

  return (
    <div className='flex  my-30 justify-center max-h-screen max-w-screen mt-40 '>
      <div className="card bg-base-300 w-96 shadow-sm">
  <div className="card-body self-center">
    <h2 className="card-title self-center text-2xl text-primary">
      {
        isLoginForm ? "Login" : "Sign Up"
      }
    </h2>

    
    <div>

    <fieldset className="fieldset">
   {!isLoginForm && (
    <>
     <div className="form-group mt-4">
    <label htmlFor="firstName" className="fieldset-legend">First Name</label>
    <input
      type="text"
      id="firstName"
      value={firstName}
      onChange={(e) => setFirstName(e.target.value)}
      className="input"
      placeholder="Enter your First Name"
    />
  </div>

  <div className="form-group ">
    <label htmlFor="lastName" className="fieldset-legend">Last Name</label>
    <input
      type="text"
      id="lastName"
      value={lastName}
      onChange={(e) => setLastName(e.target.value)}
      className="input"
      placeholder="Enter your Last Name"
    />
  </div></>
   )}
  <div className="form-group">
    <label htmlFor="email" className="fieldset-legend">Email ID</label>
    <input
      type="text"
      id="email"
      value={email}
      onChange={(e) => setEmailId(e.target.value)}
      className="input"
      placeholder="Enter your Email ID"
    />
  </div>

  <div className="form-group">
    <label htmlFor="password" className="fieldset-legend">Password</label>
    <input
      type="password"
      id="password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="input"
      placeholder="Enter a Strong password"
    />
  </div>


</fieldset>


    </div>
    <p className='text-red-500'>{error}</p>
    <div className="card-actions justify-center">
      <button className="btn btn-primary self-center my-4 px-34 " onClick={isLoginForm ? handleLogin : handleSignUp}>
        {isLoginForm ? "Login" : "Sign Up"}
      </button>
    </div>
    <p className=' text-center hover:underline cursor-pointer text-blue-500' onClick={()=>setIsLoginForm(!isLoginForm)} >
      {
        isLoginForm 
         ? "New User ? Singup Here"
         : "Existing User ? Login Here"
      }
    </p>
  </div>
</div>


    </div>
  )
}

export default Login
