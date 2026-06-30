const express = require('express');
const cors = require('cors');
const apiRoutes = require('./src/routes/api');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
    res.send('Omni-Scraper Backend is Running');
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
