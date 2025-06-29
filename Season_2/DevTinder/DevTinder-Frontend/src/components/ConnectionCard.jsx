import React from 'react';

const ConnectionCard = ({ user }) => {
    const { firstName, lastName, photoUrl, age, gender, about } = user;
    return (
      <div className="card bg-base-200 rounded-lg shadow-lg w-full max-w-8xl h-[12rem] overflow-hidden flex-shrink-0">
        <div className="flex h-full w-full ">
          <div className="w-1/6 h-full overflow-hidden flex-shrink-0">
            <img src={photoUrl} alt={`${firstName} ${lastName}`} className="w-full h-full object-cover" />
          </div>
          <div className="card-body ml-8 w-2/3 p-4 text-start flex flex-col">
            <h2 className="card-title text-xl">{`${firstName} ${lastName}`}</h2>
            <p className="text-sm text-gray-300 mb-2">
              {age && gender && `Age: ${age} • Gender: ${gender}`}
            </p>
            <p className="text-gray-200 line-clamp-4 flex-grow">
              {about}
            </p>
          </div>
        </div>
      </div>
    );
  };

export default ConnectionCard;
