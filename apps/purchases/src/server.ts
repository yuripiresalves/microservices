import "dotenv/config";

import express from "express";
import axios from "axios";
import cors from "cors";
import { prisma } from "./prisma";
import { sendMessage } from "./kafka";

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

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    return res.status(400).json({ message: "Product not found" });
  }

  try {
    const customer = await prisma.customer.create({
      data: {
        id: crypto.randomUUID(),
        name,
        email,
      },
    });

    const purchase = await prisma.purchase.create({
      data: {
        id: crypto.randomUUID(),
        customerId: customer.id,
        productId,
      },
    });

    await sendMessage("purchases.new-purchase", {
      product: {
        id: product.id,
        title: product.title,
      },
      customer: {
        name: customer.name,
        email: customer.email,
      },
      purchaseId: purchase.id,
    });

    return res.status(201).send();
  } catch (error) {
    console.log("[PURCHASES]", error.response.data);
    return res.status(400).json(error.response.data);
  }
});

app.listen(3000, () => {
  console.log("[PURCHASES] Server is listening on port 3000");
});
