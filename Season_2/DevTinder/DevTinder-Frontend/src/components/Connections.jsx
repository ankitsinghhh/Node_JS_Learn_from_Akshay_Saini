import React, { useEffect } from 'react'
import { BASE_URL } from '../utils/constants'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { addConnections } from '../utils/connectionSlice'
import UserCard from './UserCard'
import ConnectionCard from './ConnectionCard'

const Connections = () => {

    const dispatch = useDispatch()
    const connections = useSelector((store)=>store.connections)

    const fetchConnections = async ()=>{
        try{
            const res = await axios.get(
                BASE_URL+"/user/connections",
                {withCredentials:true}
            )
            console.log(res?.data?.data)
            dispatch(addConnections(res?.data?.data))
        }
        catch(err){
            //handle error case
        console.error(err)
        }
    }
    useEffect(()=>{
        fetchConnections()
    },[])

    if(!connections) return

    if(connections.length === 0) return <h1 className='text-3xl font-bold select-none text-center my-30'>No connections found</h1>
  return (
    <div className='text-center my-30'>
      <h1 className='text-3xl font-bold'>Connections</h1>

    <div className='flex flex-wrap  my-14 gap-10 justify-center items-center'>

    {connections.map((connection)=>{
        const {firstName,lastName,photoUrl,age,gender,about,_id} = connection
        return (
        <div key={_id} className='flex w-[1200px] items-center justify-center' > 
            {/* <img alt='profile-photo' src={connection?.photoUrl} className='w-16 h-16 rounded-full mx-auto my-5' />
            <p className='text-xl font-bold text-center'>{connection?.firstName}</p>
            */}
            <ConnectionCard   user={{firstName,lastName,photoUrl,age,gender,about,_id}} />
          
           
         </div>
      )}
      )}

    </div>
   
    </div>
  )
}

export default Connections
