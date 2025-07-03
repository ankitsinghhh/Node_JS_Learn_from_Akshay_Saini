import axios from "axios";
// import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";
import { useEffect, useState } from "react";

const PremiumRazorpay = () => {

    const [isPremium,setIsPremium] = useState(false)

    const verifyPremiumUser =  async () =>{
        try {
            const res =  await axios.get(
                BASE_URL+"/premium/verify",
                {withCredentials:true}
            );
            if(res.data.isPremium){
                setIsPremium(true)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(()=>{
        verifyPremiumUser()
    },[])

    const handleBuyClick = async (type) =>{
        try {
            const order = await axios.post(
                BASE_URL+"/payment/create",
                {
                    membershipType:type,
                },
                {withCredentials:true}
            );
            // it should open the razorpay dialogue box after the creation or orderid on razorpay
            console.log(order)
            const {amount,keyId,currency,notes,orderId} =order.data

            const options = {
                key: keyId, // Replace with your Razorpay key_id
                amount: amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
                currency: currency,
                name: 'Tinder Dev',
                description: 'Connect to other Developers',
                order_id: orderId, // This is the order_id created in the backend
                prefill: {
                  name: notes.firstName+" "+notes.lastName,
                  email: notes.email,
              
                },
                theme: {
                  color: '#F37254'
                },
                handler: verifyPremiumUser,
              };
        

            const rzp = new window.Razorpay(options)
            rzp.open()
            // console.log(res)

        } catch (error) {
            console.error("ERROR : ",error)
        }
    }

  return isPremium ?
  (<div className="flex justify-center my-30 mb-30">
    You are already a Premium User
  </div>)
  :
   (
    <div className="flex flex-col items-center justify-center min-h-screen  p-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-200">
        Choose Your Premium Plan
      </h1>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 max-w-4xl w-full">
        {/* Silver Plan Card */}
        <div className="bg-white shadow-2xl rounded-2xl p-6 flex flex-col justify-between items-center hover:scale-105 transition-transform duration-300 h-[480px] w-100">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
              Silver Plan
            </h2>
            <ul className="text-gray-600 mb-4 text-left list-disc list-inside">
              <li>See who liked your profile</li>
              <li>Daily 10 profile boosts</li>
              <li>Advanced filters (location, skills, interests)</li>
              <li>Access to premium developer communities</li>
            </ul>
            <p className="text-3xl font-bold text-gray-800 mb-4">
              ₹799 <span className="text-base font-medium">/month</span>
            </p>
          </div>
          <button
            onClick={() => handleBuyClick("Silver")}
            className="bg-blue-500 text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition-colors duration-200 cursor-pointer mt-4"
          >
            Buy Silver
          </button>
        </div>

        {/* Separator */}
        <div className="hidden sm:flex flex-col items-center">
          <div className="border-l-2 border-gray-400 h-64"></div>
          <span className="text-gray-500 mt-2">or</span>
          <div className="border-l-2 border-gray-400 h-64"></div>
        </div>

        {/* Gold Plan Card */}
        <div className="bg-yellow-50 shadow-2xl rounded-2xl p-6 flex flex-col justify-between items-center border border-yellow-300 hover:scale-105 transition-transform duration-300 h-[480px] w-100">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-semibold mb-4 text-yellow-700">
              Gold Plan
            </h2>
            <ul className="text-yellow-800 mb-4 text-left list-disc list-inside">
              <li>All Silver features included</li>
              <li>Unlimited profile boosts</li>
              <li>Priority placement in search results</li>
              <li>Profile badge (Gold Verified)</li>
              <li>Exclusive hackathon & collab groups</li>
              <li>See who viewed your profile</li>
              <li>Advanced analytics on views and interactions</li>
            </ul>
            <p className="text-3xl font-bold text-yellow-900 mb-4">
              ₹1599 <span className="text-base font-medium">/month</span>
            </p>
          </div>
          <button
            onClick={() => handleBuyClick("Gold")}
            className="bg-yellow-400 text-yellow-900 px-5 py-2 rounded-lg hover:bg-yellow-500 transition-colors duration-200 cursor-pointer mt-4"
          >
            Buy Gold
          </button>
        </div>
      </div>

    
    </div>
   )  ;
};

export default PremiumRazorpay;
