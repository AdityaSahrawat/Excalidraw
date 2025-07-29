import express from "express"
import cors from "cors"
import userRouter from "./routes/userRoutes";
import webRouter from "./routes/webRoutes";
import cookieParser from "cookie-parser"
import dotenv from "dotenv"
dotenv.config()
const PORT = process.env.PORT!
const PORT_client = process.env.PORT_client

const app = express();
app.use(express.json());

const allowedOrigins = [
  `http://localhost:${PORT_client}`,
  "https://sketchhub.fly.dev"
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
// bhjbj,h

app.use("/v1/user" , userRouter)
app.use("/v1/web" , webRouter )



app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});