import axios from 'axios'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addRequests, removeRequests } from '../utils/requestSlice'
import { BASE_URL } from '../utils/constants'

const Requests = () => {
  const dispatch = useDispatch()
  const requests = useSelector(store => store.requests)

  const reviewRequests = async (status,_id) =>{
    try {
        const res = await axios.post(
          BASE_URL + "/request/review/"+status+"/"+_id,
          {},
          { withCredentials: true }
        )
        // dispatch(addRequests(res.data.data))
        dispatch(removeRequests(_id))
      
    } catch (err) {
        console.error(err)
    }
  }

  const fetchRequests = async () => {
    try {
      const res = await axios.get(
        BASE_URL + "/user/requests/received",
        { withCredentials: true }
      )
      dispatch(addRequests(res.data.data))
    } catch (err) {
      console.error(err)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  if (!requests) return null
  if (requests.length === 0) {
    return <h1 className='text-3xl font-bold select-none text-center my-30'>No Requests found</h1>
  }

  return (
    <div className='text-center my-30'>
      <h1 className='text-3xl font-bold'>Connection Requests</h1>
      <div className='flex flex-wrap my-14 gap-10 justify-center items-center'>
        {requests.map(request => {
          const { _id, firstName, lastName, photoUrl, age, gender, about } = request.fromUserId
          return (
            <div key={_id} className='flex w-[1200px] items-center justify-center'>
              
              {/* ——— Inlined RequestCard JSX ——— */}
              <div className="card bg-base-200 rounded-lg shadow-lg w-full max-w-8xl h-[12rem] overflow-hidden flex-shrink-0">
                <div className="flex h-full w-full">
                  <div className="w-1/6 h-full overflow-hidden flex-shrink-0">
                    <img
                      src={photoUrl}
                      alt={`${firstName} ${lastName}`}
                      className="w-full h-full object-cover"
                    />
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
              
                  <div className='my-5 mx-6 flex gap-8 justify-end'>
                    <button className='btn btn-primary p-6 '  onClick={() => reviewRequests("rejected", request._id)} > Reject </button>
                    <button className='btn btn-secondary p-6 ' onClick={() => reviewRequests("accepted", request._id)}> Accept </button>
                 

                  </div>
                </div>
              </div>
              {/* ———————————————————————————— */}
              
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Requests
