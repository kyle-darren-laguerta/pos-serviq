const express = require('express');
const app = express();
const PORT = 3000;

app.get('/api/status', (req, res) => {
  res.json({ message: 'Backend is online and talking to Frontend!' });
});

app.listen(PORT, () => console.log(`[NOVA] Backend API running on http://localhost:${PORT}`));