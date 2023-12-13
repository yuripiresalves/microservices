import express from 'express';

const app = express();
app.use(express.json());

app.post('/access', async (req, res) => {
  const data = await req.body;

  console.log(`[ACCESS] ${data.name} comprou o produto ${data.productId}`);

  return res.status(201).json({ message: 'Access allowed' });
});

app.listen(3001, () => {
  console.log('Server is listening on port 3001');
});
