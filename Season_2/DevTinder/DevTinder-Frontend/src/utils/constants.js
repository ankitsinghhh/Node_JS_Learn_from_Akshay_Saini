//development
// export const BASE_URL =  "http://localhost:7777"

//production
// export const BASE_URL =  "/api"

//making it dynamic so it happens automatically 
export const BASE_URL = location.hostname === "localhost" ? "http://localhost:7777" : "/api"
