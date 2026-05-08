import cors from "cors";
import express from "express";
import path from "node:path";
import authRouter from "./routes/auth/auth.routes";
import initRouter from "./routes/init/init.route";
import staffManagementRouter from "./routes/staffManagement/staffManagement.routes";
import { globalErrorHandler } from "./middlewares/error/error.middleware";
const app = express();

app.use(cors());
//serve the Static files
const ROOT_DIR = path.resolve(__dirname, "..");
app.use("/uploads", express.static(path.join(ROOT_DIR, "uploads")));
app.use(express.json());

app.use("/api", authRouter);
app.use("/api", initRouter);
app.use("/api", staffManagementRouter);
app.use(globalErrorHandler);

export default app;
