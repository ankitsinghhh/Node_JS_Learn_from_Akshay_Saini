import React, { useState } from 'react'
import { BASE_URL } from '../utils/constants';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { removeUserFromFeed } from '../utils/feedSlice';

const UserCard = ({ user }) => {
  const { _id,firstName, lastName, photoUrl, age, gender, about } = user;
  const dispatch = useDispatch();
  const [showSuccess, setShowSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSendRequest = async (status,userId) =>{
    try {
        const res = await axios.post(
          BASE_URL+"/request/send/"+status+"/"+userId,
          {},
          {withCredentials: true}
          
          
        )
        dispatch(removeUserFromFeed(userId))
        if (status === "ignored") {
          setToastMessage(`${firstName} ignored`);
        } else if (status === "interested") {
          setToastMessage(`Connection Request Sent to ${firstName}`);
        }
  
        setShowSuccess(true);
  
        // hide toast after 2.5 seconds
        setTimeout(() => setShowSuccess(false), 2500);
    } catch (error) {
      console.error(error)
    }
  }
  // console.log(user, "inside the userCARD component")
  return (
  <>
    <div className="card bg-base-200 w-96 shadow-sm min-h-[620px] overflow-hidden">
      <figure className="h-90 overflow-hidden">
        <img
          src={photoUrl}
          alt={`${firstName} ${lastName}`}
          className="w-full h-full object-cover"
        />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{firstName + " " + lastName}</h2>
        <p>{age && gender && `Age: ${age}  Gender: ${gender}`}</p>
        <p>{about}</p>
        <div className="card-actions justify-center my-4 gap-6">
          <button className="btn btn-primary" onClick={()=>handleSendRequest("ignored",_id)}>Ignore</button>
          <button className="btn btn-secondary" onClick={()=>handleSendRequest("interested",_id)}>Send Request</button>
        </div>
      </div>
    </div>

    {showSuccess && (
        <div
          role="alert"
          className="alert alert-success absolute top-20 right-4 z-10 max-w-xs px-3 py-2 text-sm"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}
  </>
  );
}

export default UserCard;
