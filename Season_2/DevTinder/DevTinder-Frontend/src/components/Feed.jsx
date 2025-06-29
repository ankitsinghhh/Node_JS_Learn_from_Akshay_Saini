import axios from 'axios'
import React, { useEffect } from 'react'
import { BASE_URL } from '../utils/constants'
import { useDispatch, useSelector } from 'react-redux'
import { addFeed } from '../utils/feedSlice'
import UserCard from './UserCard'


const Feed = () => {
  const dispatch = useDispatch()
  const feed = useSelector((store)=>store.feed)
  console.log(feed)

  const getFeed = async () =>{
    if(feed) return;
    try{
      const res = await axios.get(
        BASE_URL+"/feed",
   
        {withCredentials: true}
      );
      console.log(res)
      dispatch(addFeed(res.data.data))
    }
    catch(err){
      console.error(err)
    }
  };

  useEffect( ()=>{
    getFeed()
  },[])

  if(!feed) return 

  if(feed.length <= 0) return (
    <div className = "flex justify-center my-30 mb-30 ">
        <h1 className = "text-2xl font-bold">No New Users Found</h1>
    </div> )

  return feed && (
    <div className = "flex justify-center my-30 mb-30 ">
        <UserCard user={feed[0]} />
    </div>
  )
}

export default Feed
