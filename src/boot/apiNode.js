//--aipNode.js ----
// import { boot } from "quasar/wrappers";
import axios from "axios";
import { auth } from "src/firebase/init"; // ✅ must be present

const nodeApiBaseURL =
  process.env.NODE_ENV === "production"
    ? process.env.VITE_API_BASE_URL
    : process.env.VITE_API_LOCAL || "http://localhost:3000";

console.log("🧠 Node API base URL:", nodeApiBaseURL);

const apiNode = axios.create({
  baseURL: nodeApiBaseURL,
});

apiNode.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export { apiNode, nodeApiBaseURL };
