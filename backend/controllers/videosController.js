// videosController.js
const admin = require("firebase-admin");
const dbFirestore = admin.firestore(); // Firestore instance

// Fetch videos
exports.getVideos = async (req, res) => {
  try {
    console.log("getVideos route triggered");

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Unauthorized: Missing or invalid Authorization header");
      return res.status(401).send("Unauthorized");
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    console.log("Fetching videos for userId:", userId);

    const snapshot = await dbFirestore
      .collection("videos")
      .where("userId", "==", userId)
      .orderBy("date", "desc")
      .get();

    const videos = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log("Videos fetched successfully:", videos.length);
    res.send(videos);
  } catch (error) {
    console.error(
      "Error fetching Firestore videos. Ensure Firestore composite index is created:",
      error,
    );
    res.status(500).send("Error fetching videos");
  }
};

// Delete video
exports.deleteVideo = async (req, res) => {
  console.log("Delete a Video triggered", req.params.id);
  try {
    const idToken = req.headers.authorization?.split(" ")[1];
    if (!idToken) {
      return res.status(401).send("Unauthorized: Missing Firebase token");
    }

    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const videoId = req.params.id;
    const videoRef = dbFirestore.collection("videos").doc(videoId);
    const videoDoc = await videoRef.get();

    if (!videoDoc.exists || videoDoc.data().userId !== userId) {
      return res
        .status(403)
        .send("Unauthorized: You can only delete your own videos");
    }

    await videoRef.delete();
    res.status(200).send({ message: "Video deleted successfully" });
  } catch (error) {
    console.error("Error verifying token:", error);
    res.status(401).send("Unauthorized: Invalid Firebase token");
  }
};
//--------------------------video tag update ------------------
exports.togglePostVisibility = async (req, res) => {
  const { videoId, makePublic } = req.body;
  console.log(videoId);

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).send("Unauthorized");
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const userId = decodedToken.uid;

    const postRef = admin.firestore().collection("videos").doc(videoId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return res.status(404).send("Post not found");
    }

    const video = postSnap.data();

    if (video.userId !== userId) {
      return res.status(403).send("Forbidden: You do not own this post");
    }

    // Update tags field
    const tags = video.tags || [];
    let updatedTags;

    if (makePublic) {
      updatedTags = Array.from(new Set([...tags, "public"])).filter(
        (t) => t !== "private",
      );
    } else {
      updatedTags = Array.from(new Set([...tags, "private"])).filter(
        (t) => t !== "public",
      );
    }

    await postRef.update({
      tags: updatedTags,
    });

    res.send("Post visibility updated successfully");
  } catch (err) {
    console.error("❌ Error updating post visibility:", err);
    res.status(500).send("Server error while updating visibility");
  }
};
