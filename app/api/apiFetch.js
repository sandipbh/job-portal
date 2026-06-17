import { cookies } from "next/headers";

export async function apiFetch(
  url,
  {
    method = "GET",
    body = null,
    headers = {},
    cache = "no-store",
  } = {}
) {
     

     const token =(await cookies()).get("regToken")?.value;

   
    let data = {};
  
        try {
        data =JSON.parse(token);
        } catch (err) {
        console.error("Invalid JSON token:", err);
        data = {};
        }

        //console.log("API Fetch token data:", data);
        
    const AccessToken =data.external.accessToken || null 
    // console.log("API body:", body);

  
  const response = await fetch(url, {
    method,
    cache,
    headers: {
      "Content-Type": "application/json",
      ...(AccessToken ? { Authorization: `Bearer ${AccessToken}` } : {}),
      ...headers,
    },
    ...(body ? { body } : {}),
  });

  console.log("API Fetch response status:", response );
  if (response.status === 401) {
    throw new Error("Unauthorized");
  }

  return response;
}



// import { cookies } from "next/headers";

// export async function apiFetch(url, options = {}) {
  
// //const token = req.cookies.get("regToken")?.value;

//     const token = cookies().get("regToken")?.value;
//     const data =   JSON.parse(token);  

//     const AccessToken = data.AccessToken || null 
//     const   RefreshToken= data.RefreshToken || null
//     const   UqId= data.UqId || null
//     const   user= data.user || null
//     const   external= data.external || null
 

//   return fetch(url, {
//     ...options,
//     headers: {
//       ...(options.headers || {}),
//       Authorization: `Bearer ${AccessToken}`,
//       "Content-Type": "application/json"
//     }
//   });
// }