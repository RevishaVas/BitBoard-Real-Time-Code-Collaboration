import {redis, pub, sub } from "../config/redisClient.js";
export const submitCode = async (req, res) => {
  const { code, language, roomId, input } = req.body;
  const submissionId = `submission-${Date.now()}-${roomId}`;

  try {
    const payload = { 
      code, 
      language, 
      roomId, 
      input, 
      submissionId,
      type: "execution_request" 
    };
    
    await redis.lPush("problems", JSON.stringify(payload));
   
    const subscriber = redis.duplicate();
    await subscriber.connect();

    const timeout = 10000; 
    const result = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        subscriber.unsubscribe(roomId);
        resolve({ 
          output: "Execution timed out.",
          type: "execution_result"
        });
      }, timeout);

      subscriber.subscribe(roomId, (message) => {
        try {
          const parsed = JSON.parse(message);
          if (parsed.submissionId === submissionId) {
            clearTimeout(timer);
            subscriber.unsubscribe(roomId);
            resolve({
              output: parsed.output,
              type: "execution_result"
            });
          }
        } catch (err) {
          clearTimeout(timer);
          subscriber.unsubscribe(roomId);
          resolve({
            output: message,
            type: "execution_result"
          });
        }
      });
    });

    await subscriber.quit();
    
    await pub.publish(roomId, JSON.stringify({
      type: "execution_result",
      output: result.output,
      submissionId,
      roomId
    }));

    res.status(200).json({ 
      submissionId, 
      output: result.output 
    });

  } catch (error) {
    console.error("Submission error:", error);
    res.status(500).json({ error: "Failed to process submission" });
  }
};
