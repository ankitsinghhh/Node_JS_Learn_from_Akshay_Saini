import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../utils/constants";

const Premium = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleBuyClick = (plan) => {
    setSelectedPlan(plan);
    setShowModal(true);
  };

  const handleCopyUPI = () => {
    navigator.clipboard.writeText("7983476567@ibl");
    alert("UPI ID copied to clipboard!");
  };

  const handleMarkAsPaid = async () => {
    setShowModal(false);

    try {
        const response = await axios.post(
            BASE_URL + "/premiumRequest",
            { plan: selectedPlan },
            { withCredentials: true }  // <-- ADD THIS
          );

      if (response.data.success) {
        alert(
          "✅ Payment marked! We will verify and enable your premium shortly."
        );
      } else {
        alert(" Error: " + response.data.message);
      }
    } catch (error) {
      console.error(error);
      alert(" Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-80 text-center shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-white transition cursor-pointer"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold mb-4 text-white">
              Pay via UPI
            </h2>
            <img
              src="./src/assets/qrcode.png"
              alt="UPI QR"
              className="w-40 h-40 mx-auto mb-4 object-cover rounded-lg border border-gray-700"
            />
            <p className="mb-2 text-gray-300">Scan QR or pay to:</p>

            {/* UPI ID with copy icon */}
            <div className="flex items-center justify-center bg-gray-800 rounded px-2 py-1 mb-4">
              <input
                type="text"
                value="7983476567@ibl"
                readOnly
                className="bg-transparent text-gray-100 text-center flex-1 outline-none"
              />
              <button
                onClick={handleCopyUPI}
                className="text-blue-400 hover:text-blue-500 transition ml-2"
                title="Copy UPI ID"
              >
                📋
              </button>
            </div>

            <p className="mb-4 text-white">
              Amount: {selectedPlan === "Silver" ? "₹799" : "₹1599"}
            </p>
            <button
              onClick={handleMarkAsPaid}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition w-full"
            >
              I have paid
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
