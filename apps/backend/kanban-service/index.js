const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const columnRoutes = require('./routes/columnRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
   origin: 'http://localhost:5173',
   credentials: true
 }));

app.use(express.json());

app.use(cors());
app.use(express.json());
app.use('/api/tasks', taskRoutes);
app.use('/api/columns', columnRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => {
  console.error('MongoDB connection error:', err);
});


// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// require('dotenv').config();

// const app = express();

// app.use(cors({
//   origin: 'http://localhost:5173',
//   credentials: true
// }));

// app.use(express.json());

// const PORT = process.env.PORT || 5000;


// app.get('/', (req, res) => {
//   res.send('API is running...');
// });

// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));