const express = require('express');
const connectDB = require('./config/db');
const app = express();
const db = require('./config/db');
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json({extended: false}));

app.use('/api/users', require('./routes/api/users'));
app.use('/api/profile', require('./routes/api/profile'));
app.use('/api/posts', require('./routes/api/posts'));
app.use('/api/auth', require('./routes/api/auth'));

app.get('/', (req, res) => {
    res.send('API running')
})

app.listen(PORT, () =>
    console.log(`Server running on port ${PORT}`)
);