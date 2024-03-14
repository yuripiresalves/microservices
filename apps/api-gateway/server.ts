import express from "express";
import httpProxy from "express-http-proxy";
import logger from "morgan";

const app = express();

const URLS = {
  PURCHASES_API_URL: "http://localhost:3000",
  WHOAMI_API_URL: "http://localhost:3000/whoami",
};

app.use(logger("dev"));

app.post("/purchases", httpProxy(URLS.PURCHASES_API_URL));
app.get("/whoami", httpProxy(URLS.WHOAMI_API_URL));

app.listen(3333, () => {
  console.log("API Gateway listening on port 3333");
});
