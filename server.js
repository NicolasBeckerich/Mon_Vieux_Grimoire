const express = require('express');
const app = express();
const PORT = 3000;

app.get('/', (req, res) => {
    res.send('Test 1 2 test Roger ');
});

app.listen(PORT, () => {
    console.log(`Serveur qui marche ! ${PORT}`);
});