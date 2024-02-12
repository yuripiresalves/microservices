import express from "express";

const app = express();
app.use(express.json());

const accesses = [
  {
    productId: 1,
    productName: "Product 1",
    userEmail: "yuri@gmail.com",
    userName: "User 1",
    hasAccess: true,
  },
  {
    productId: 2,
    productName: "Product 2",
    userEmail: "user@gmail.com",
    userName: "User 2",
    hasAccess: true,
  },
  {
    productId: 2,
    productName: "Product 2",
    userEmail: "a@gmail.com",
    userName: "User 3",
    hasAccess: true,
  },
];

app.post("/access", async (req, res) => {
  const { name, email, productId } = await req.body;

  const access = accesses.find(
    (access) => access.userEmail === email && access.productId === productId
  );

  if (!access) {
    accesses.push({
      productId,
      productName: `Product ${productId}`,
      userEmail: email,
      userName: name,
      hasAccess: true,
    });

    console.log(`[ACCESS] ${name} comprou o produto ${productId}`);
    console.log("Tabela de acessos atualizada:");
    console.table(accesses);

    return res.status(201).json({ message: "Access allowed" });
  }

  console.log(`[ACCESS] ${name} já possui acesso ao produto ${productId}`);
  return res.status(409).json({ message: "Access already allowed" });
});

app.listen(3001, () => {
  console.log("[ACCESS] Server is listening on port 3001");
});
