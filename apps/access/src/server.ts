import "dotenv/config";

import express from "express";
import { prisma } from "./prisma";
import { kafka } from "./kafka";

const app = express();
app.use(express.json());

interface PurchasesNewPurchaseMessage {
  product: {
    id: string;
    title: string;
  };
  customer: {
    name: string;
    email: string;
    id: string;
  };
  purchaseId: string;
}

async function main() {
  const consumer = kafka.consumer({
    groupId: "access-group",
    allowAutoTopicCreation: true,
  });

  await consumer.connect();
  await consumer.subscribe({ topic: "purchases.new-purchase" });

  await consumer.run({
    eachMessage: async ({ message }) => {
      const purchaseJSON = message.value?.toString();

      if (!purchaseJSON) {
        return;
      }

      const purchase: PurchasesNewPurchaseMessage = JSON.parse(purchaseJSON);

      let product = await prisma.product.findUnique({
        where: { id: purchase.product.id },
      });

      if (!product) {
        product = await prisma.product.create({
          data: {
            id: purchase.product.id,
            title: purchase.product.title,
          },
        });
      }

      let customer = await prisma.customer.findUnique({
        where: { email: purchase.customer.email },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            id: purchase.customer.id,
            name: purchase.customer.name,
            email: purchase.customer.email,
          },
        });
      }

      const costumerHasAccess = await prisma.access.findFirst({
        where: {
          customerId: customer?.id,
          productId: purchase.product.id,
        },
      });

      if (costumerHasAccess) {
        console.log(
          `[ACCESS] User ${purchase.customer.name} already has access to ${purchase.product.title}`
        );
        return;
      }

      await prisma.access.create({
        data: {
          id: crypto.randomUUID(),
          customerId: customer?.id,
          productId: purchase.product.id,
          purchaseId: purchase.purchaseId,
        },
      });

      console.log(
        `[ACCESS] Access allowed to user ${purchase.customer.name} to ${purchase.product.title}`
      );
    },
  });
}

main().then(() => {
  console.log("[ACCESS] Listening to Kafka messages");
});
