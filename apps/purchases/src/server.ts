import express from "express";
import axios from "axios";
import cors from "cors";
import { prisma } from "./prisma";

const app = express();
app.use(express.json());
app.use(cors());

const products = [
  {
    id: 1,
    name: "Product 1",
    price: 100,
  },
  {
    id: 2,
    name: "Product 2",
    price: 200,
  },
  {
    id: 3,
    name: "Product 3",
    price: 300,
  },
];

app.post("/purchases", async (req, res) => {
  const data = await req.body;
  const { productId, name, email } = data;

  const product = await prisma.product.findById({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  try {
    await axios.post("http://localhost:3001/access", {
      ...data,
    });

    console.log("[PURCHASE]", data);
    return res.status(201).json({ message: "Purchase created" });
  } catch (error) {
    console.log("[PURCHASE]", error.response.data);
    return res.status(409).json(error.response.data);
  }
});

app.listen(3000, () => {
  console.log("[PURCHASE] Server is listening on port 3000");
});
