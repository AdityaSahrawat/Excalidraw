import express from "express"
import cors from "cors"
import userRouter from "./routes/userRoutes";
import webRouter from "./routes/webRoutes";
import cookieParser from "cookie-parser"
import dotenv from "dotenv";
dotenv.config();
import { Env } from "./config/env";
const PORT = Env.PORT;
const PORT_client = Env.PORT_CLIENT;
const CLIENT_URL = Env.CLIENT_URL;

const app = express();
app.use(express.json());

const allowedOrigins = [
  `http://localhost:${PORT_client}`,
  CLIENT_URL
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(cookieParser())

app.use("/v1/user" , userRouter)
app.use("/v1/web" , webRouter )



app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});