 import { SignJWT, jwtVerify } from "jose";

 
 

const ACCESS_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const REFRESH_SECRET = new TextEncoder().encode(process.env.REFRESH_SECRET);

export async function generateAccessToken(user) {
  return await new SignJWT({
    id: user.Id,
    email: user.Email,
    role: user.Role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("50m")
    .sign(ACCESS_SECRET);
}
  

export async function generateRefreshToken() {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);

  return Array.from(array, b => b.toString(16).padStart(2, "0")).join("");
}
export async function verifyRefreshToken(token) {
  try {
    const { payload } = await jwtVerify(token, REFRESH_SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function verifyAccessToken(token) {
  try {
    const { payload } = await jwtVerify(token, ACCESS_SECRET);
    console.log("JWT VERIFY SUCCESS:", payload);
    return payload;
  } catch (err) {
    console.log("JWT VERIFY ERROR:", err.message);
    return null;
  }
}