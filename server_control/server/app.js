const express = require('express');
const connectDB = require('./dbConnection');
const serverRoutes = require('./routes/serverRoutes');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors()); // add this l ine before your routes
connectDB();

app.use(express.json());
app.use('/api', serverRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
