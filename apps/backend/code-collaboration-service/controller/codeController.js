import { redis } from "../config/redisClient.js";


export const submitCode = async (req, res) => {
  const { code, language, roomId, input } = req.body;
  const submissionId = `submission-${Date.now()}-${roomId}`;

  try {
    await redis.lPush("problems", JSON.stringify({ code, language, roomId, submissionId, input }));
    await redis.lPush("problems_history", JSON.stringify({ code, language, roomId, submissionId, input }));
    res.status(200).json({ message: "Submission received", submissionId });
  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: "Failed to store submission" });
  }
};