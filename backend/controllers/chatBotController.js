//--This is the chatBotController.js --------
const openai = require("../utils/openaiClient");
const ChatbotLog = require("../models/chatBot/chatbotLog");
const admin = require("firebase-admin");

// Initialize OpenAI
//const openai = new OpenAI({
// apiKey: process.env.OPENAI_API_KEY, // Ensure this is set in environment variables
//});

console.log("GPT API Key:", process.env.OPENAI_API_KEY);

// ✅ **Declare all functions first before exporting them**
const sendMessage = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let userId;
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
    } catch (error) {
      console.error("Error verifying ID token:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const { userMessage, sessionId } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: "User message is required" });
    }

    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: userMessage }],
      max_tokens: 100,
    });

    const botResponse = response.choices[0]?.message?.content || "No response";
    if (!botResponse) {
      return res.status(500).json({ error: "AI response failed" });
    }

    // Store chat log in MongoDB with Firebase `userId`
    const newLog = new ChatbotLog({
      userId,
      sessionId: sessionId || `session-${userId}-${Date.now()}`, // Default session ID
      query: userMessage,
      response: botResponse,
      timestamp: new Date(), // Explicitly set timestamp
    });

    await newLog.save();
    res.status(200).json({ botResponse });
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Failed to process the request" });
  }
};

const postLogs = async (req, res) => {
  try {
    const { userMessage } = req.body;
    if (!userMessage) {
      return res.status(400).json({ error: "User message is required" });
    }

    const botResponse = `Echo: ${userMessage}`;
    const log = {
      id: Date.now().toString(),
      userMessage,
      botResponse,
    };

    res.status(201).json(log);
  } catch (error) {
    console.error("Error in postLogs:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteLog = (req, res) => {
  const { id } = req.params;
  res.status(200).json({ message: `Log with ID ${id} deleted.` });
};
//------------------------------------------
const deleteUserLog = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { id } = req.params;

    const log = await ChatbotLog.findOne({ _id: id, userId });
    if (!log)
      return res.status(404).json({ error: "Log not found or not yours" });

    await ChatbotLog.deleteOne({ _id: id });
    res.json({ message: "Log deleted" });
  } catch (err) {
    console.error("deleteUserLog error:", err);
    res.status(500).json({ error: "Failed to delete log" });
  }
};

const getChatHistory = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];

    // 🔍 Debug: Log received token
    console.log("🔍 Received Token:", idToken);

    let userId;
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
      console.log("✅ Decoded User ID:", userId);
    } catch (error) {
      console.error("❌ Error verifying ID token:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    console.log("🔍 Searching for chat logs with userId:", userId);

    let chatLogs = await ChatbotLog.find({ userId })
      .select("timestamp query response")
      .sort({ timestamp: -1 });

    console.log("✅ Retrieved chat logs from DB:", chatLogs);
    res.status(200).json(chatLogs);
  } catch (error) {
    console.error("❌ Error retrieving chat logs:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

const getChatSessions = async (req, res) => {
  console.log("getChatSessions function called"); // Debugging
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Unauthorized: Missing token"); // Debugging
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let userId;
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      userId = decodedToken.uid;
      console.log("Decoded userId:", userId); // Debugging
    } catch (error) {
      console.error("Error verifying ID token:", error);
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    // Fetch chat sessions grouped by sessionId
    const chatSessions = await ChatbotLog.aggregate([
      { $match: { userId } }, // Filter by userId
      {
        $group: {
          _id: "$sessionId", // Group by sessionId
          timestamp: { $first: "$timestamp" }, // Get the first timestamp in the session
          preview: { $first: "$query" }, // Get the first query in the session
        },
      },
      { $sort: { timestamp: -1 } }, // Sort by timestamp (newest first)
    ]);

    console.log("Chat sessions from DB:", chatSessions); // Debugging

    // Map the response to match the frontend's expected format
    const formattedSessions = chatSessions.map((session) => ({
      sessionId: session._id,
      timestamp: session.timestamp,
      preview: session.preview,
    }));

    console.log("✅ Returning chat sessions:", formattedSessions); // Debugging
    res.status(200).json(formattedSessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};
const getChatBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const chatLogs = await ChatbotLog.find({ sessionId }).sort({
      timestamp: 1,
    });

    res.status(200).json(chatLogs);
  } catch (error) {
    console.error("Error retrieving chat logs:", error);
    res.status(500).json({ error: "Failed to fetch chat history" });
  }
};

//----------------------------
/**
 * Log GPT-4 Vision result to ChatbotLog
 * Expects: userId, prompt, imageUrls, response, modelUsed?, tokensUsed?, score?, tags?
 */
const logVisionResult = async (req, res) => {
  try {
    const {
      userId,
      prompt,
      imageUrls,
      response,
      modelUsed = "gpt-4-vision-preview",
      tokensUsed = 0,
      score,
      tags = [],
    } = req.body;

    if (!userId || !prompt || !imageUrls || !response) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const sessionId = `vision-${userId}-${Date.now()}`;

    const log = new ChatbotLog({
      userId,
      sessionId,
      query: prompt,
      response: typeof response === "string" ? { text: response } : response,
      modelUsed,
      tokensUsed,
      confidenceScore: 1,
      imageUrls,
      type: "vision",
      tags,
    });

    if (typeof score === "number") {
      log.response.score = score;
    }

    await log.save();

    res.status(201).json({ message: "Vision log saved", sessionId });
  } catch (err) {
    console.error("logVisionResult error:", err);
    res.status(500).json({ error: "Failed to save vision log" });
  }
};

//---------------------------------------------------------------------------
const getVisionLogsByUser = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const logs = await ChatbotLog.find({ userId, type: "vision" }).sort({
      timestamp: -1,
    });

    res.status(200).json(logs);
  } catch (error) {
    console.error("Error fetching vision logs:", error);
    res.status(500).json({ error: "Failed to fetch vision logs" });
  }
};
//-------------------------------------------------------------------
const getLatestVisionEval = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const latest = await ChatbotLog.findOne({
      userId,
      type: "vision",
    }).sort({ timestamp: -1 });

    if (!latest) {
      return res.status(404).json({ error: "No vision logs found." });
    }

    res.json(latest.response);
  } catch (err) {
    console.error("getLatestVisionEval error:", err);
    res.status(500).json({ error: "Failed to fetch evaluation." });
  }
};

//-------------------------------------------------------
const getVisionEvalBySessionId = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const { sessionId } = req.params;

    const log = await ChatbotLog.findOne({ userId, sessionId });
    if (!log) return res.status(404).json({ error: "Log not found" });

    res.json(log.response);
  } catch (err) {
    console.error("getVisionEvalBySessionId error:", err);
    res.status(500).json({ error: "Failed to fetch evaluation" });
  }
};

//------------------------------------------------------------

// ✅ **Correctly Export All Functions**
module.exports = {
  sendMessage,
  postLogs,
  deleteLog,
  getChatHistory,
  getChatSessions, // ✅ Now defined before export
  getChatBySession, // ✅ Keep this function
  logVisionResult, // ✅ ADD THIS LINE
  getVisionLogsByUser, // ✅ Add this to exports
  getLatestVisionEval,
  getVisionEvalBySessionId,
  deleteUserLog,
};
