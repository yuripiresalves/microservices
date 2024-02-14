import "dotenv/config";

import express from "express";
import cors from "cors";
import { prisma } from "./prisma";
import { sendMessage } from "./kafka";

const app = express();
app.use(express.json());
app.use(cors());

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
    let customer = await prisma.customer.findUnique({
      where: {
        email,
      },
    });

    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          id: crypto.randomUUID(),
          name,
          email,
        },
      });
    }

    const userHasAlreadyPurcheasedProduct = await prisma.purchase.findFirst({
      where: {
        productId,
        customerId: customer.id,
      },
    });

    if (userHasAlreadyPurcheasedProduct) {
      return res
        .status(400)
        .json({ message: "User has already purchased this product" });
    }

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
        id: customer.id,
      },
      purchaseId: purchase.id,
    });

    return res.status(201).send();
  } catch (error) {
    console.log("[PURCHASES]", error);
    return res.status(400).json(error);
  }
});

app.listen(3000, () => {
  console.log("[PURCHASES] Server is listening on port 3000");
});
