// REPLACE with your actual Render URL
const BASE_URL = 'https://restaurant-app-python.onrender.com/api'; 

// export const loginUser = async (username, password) => {
//   try {
//     // We send query parameters because the Python backend expects them
//     const response = await fetch(`${BASE_URL}/login?username=${username}&password=${password}`, {
//       method: 'POST',
//     });
    
//     const data = await response.json();

//     if (!response.ok) {
//       throw new Error(data.detail || 'Login failed');
//     }
//     // testing
//     // Returns object like: { message: "Login successful", username: "admin" }
//     return data; 
//   } catch (error) {
//     throw error;
//   }
// };