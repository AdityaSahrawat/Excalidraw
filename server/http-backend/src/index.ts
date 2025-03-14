import express from "express"
import cors from "cors"
import userRouter from "./routes/userRoutes";
import webRouter from "./routes/webRoutes";

const app = express();
app.use(express.json());
app.use(cors())


app.use("/v1/user" , userRouter)
app.use("/v1/web" , webRouter )


const PORT = 3009;
app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});