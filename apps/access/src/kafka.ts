import { Kafka } from "kafkajs";

if (!process.env.KAFKA_BROKER) {
  throw new Error("Kafka broker address not set!");
}

export const kafka = new Kafka({
  clientId: "purchases",
  brokers: [process.env.KAFKA_BROKER],
  ...(process.env.KAFKA_USER
    ? {
        sasl: {
          mechanism: "scram-sha-256",
          username: process.env.KAFKA_USER ?? "",
          password: process.env.KAFKA_PASS ?? "",
        },
        ssl: true,
      }
    : {}),
});

interface PurchasesNewPurchaseMessage {
  product: {
    id: string;
    title: string;
  };
  customer: {
    name: string;
    email: string;
  };
  purchaseId: string;
}

async function main() {
  // TACAR ISSO NO SERVER.TS
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

      // await enrollStudentToCourse.execute({
      //   student: {
      //     name: purchase.customer.name,
      //     email: purchase.customer.email,
      //   },
      //   course: {
      //     title: purchase.product.title,
      //     purchasesProductId: purchase.product.id,
      //   },
      //   purchasesEnrolledByPurchaseId: purchase.purchaseId,
      // })

      // await

      console.log(
        `[ACCESS] Enrolled user ${purchase.customer.name} to ${purchase.product.title}`
      );
    },
  });
}

main().then(() => {
  console.log("[ACCESS] Listening to Kafka messages");
});
