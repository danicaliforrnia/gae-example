const express = require('express');
const app = express();

app.get('/api/hello', (req, res) => {
    res.send({ message: 'Hello from App Engine!' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
