const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use(cors());
app.use(express.json());

const graphRoutes = require("./routes/graphstatus");

app.use("/api/status", graphRoutes);



app.get("/", (req, res) => {
  res.send("✅ status-service is live!");
});

app.listen(PORT, () => {
  console.log(`status-service running on http://localhost:${PORT}`);
});
