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
app.use(cors({
  origin : `http://localhost:${PORT_client}`,
  credentials : true
}))
app.use(cookieParser())
// bhjbj,h

app.use("/v1/user" , userRouter)
app.use("/v1/web" , webRouter )



app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});