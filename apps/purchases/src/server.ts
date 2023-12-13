import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());

app.post('/purchases', async (req, res) => {
  const data = await req.body;

  console.log('[PURCHASE]', data);
  await axios.post('http://localhost:3001/access', {
    ...data,
  });

  return res.status(201).json({ message: 'Purchase created' });
});

app.listen(3000, () => {
  console.log('Server is listening on port 3000');
});
