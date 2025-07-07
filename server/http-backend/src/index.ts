import express from "express"
import cors from "cors"
import userRouter from "./routes/userRoutes";
import webRouter from "./routes/webRoutes";
import cookieParser from "cookie-parser"

const app = express();
app.use(express.json());
app.use(cors({
  origin : "http://localhost:3000",
  credentials : true
}))
app.use(cookieParser())


app.use("/v1/user" , userRouter)
app.use("/v1/web" , webRouter )


const PORT = 3009;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});