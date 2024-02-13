import { Kafka } from "kafkajs";

if (!process.env.KAFKA_BROKER) {
  throw new Error("Kafka broker address not set!");
}

const kafka = new Kafka({
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

const producer = kafka.producer({
  allowAutoTopicCreation: true,
});

producer.connect().then(() => {
  console.log("[PURCHASES] Kafka producer connected");
});

export const sendMessage = async (topic: string, message: any) => {
  console.log(`[PURCHASES] New message on topic "${topic}"`);
  console.log(JSON.stringify(message, null, 2));

  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
};
