import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../utils/constants';
import { addUser } from '../utils/userSlice';
import UserCard from './UserCard';

const EditProfile = ({ user }) => {
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [photoUrl, setPhotoUrl] = useState(user.photoUrl);
  const [age, setAge] = useState(user.age || "");
  const [gender, setGender] = useState(user.gender || "");
  const [about, setAbout] = useState(user.about || "");
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const dispatch = useDispatch();
//   const navigate = useNavigate();

  const saveProfile = async () => {
    try {
      const res = await axios.patch(BASE_URL + "/profile/edit", {
        firstName,
        lastName,
        photoUrl,
        age,
        gender,
        about
      }, { withCredentials: true });

      dispatch(addUser(res?.data?.data));
      setShowSuccess(true);
    //   navigate('/');
    } catch (err) {
      setError(err?.response?.data || "Something went wrong");
      console.error(err);
    }
  };

   // Hide the success alert after 3 seconds
   useEffect(() => {
    if (showSuccess) {
      const id = setTimeout(() => setShowSuccess(false), 3000);
      return () => clearTimeout(id);
    }
  }, [showSuccess]);

  return (
    <div className="flex flex-col md:flex-row justify-center items-start gap-6 my-10 px-4">
        

      {/* Edit Profile Card */}
      <div className="card bg-base-200 shadow-md p-6 w-full md:w-[400px] h-full flex flex-col justify-between">
     
        <div>
          <h2 className="text-center text-2xl font-semibold text-primary mb-4">Edit Profile</h2>

          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="label">First Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label className="label">Last Name</label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label className="label">Photo URL</label>
              <input
                type="url"
                className="input input-bordered w-full"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                placeholder="Enter your photo URL"
              />
            </div>

            <div>
              <label className="label">Age</label>
              <input
                type="number"
                className="input input-bordered w-full"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter your age"
              />
            </div>

            <div>
              <label className="label">Gender</label>
              <select
                className="select select-bordered w-full"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="label">About</label>
              <textarea
                className="textarea textarea-bordered w-full"
                value={about}
                onChange={(e) => setAbout(e.target.value)}
                placeholder="Tell us about yourself"
              ></textarea>
            </div>
          </div>

          {error && <p className="text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-center mt-4">
          <button
            className="btn btn-primary w-full"
            onClick={saveProfile}
          >
            Save Profile
          </button>
        </div>
      </div>

      {/* UserCard Preview */}
      <div className="w-full md:w-[400px]">
        <UserCard user={{ firstName, lastName, photoUrl, age, gender, about }} />
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
    <span>Your profile has been updated!</span>
  </div>
)}


    </div>
  );
};

export default EditProfile;
