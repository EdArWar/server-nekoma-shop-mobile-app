const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const fileUpload = require("express-fileupload");
const corsMiddleware = require("./middleware/cors.middleware");
const authRouter = require("./router/AuthRouter");
const externalAuthRouter = require("./router/ExternalAuthRouter");
const productRouter = require("./router/ProductRouter");

const cors = require("cors");

const PORT = process.env.PORT || 3003;

const app = express();

//socket------

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
});

app.use(cors());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(corsMiddleware);
app.use(express.static("static"));
app.use(express.static("static/avatar"));

app.use("/userAuth", authRouter);
app.use("/userExternalAuth", externalAuthRouter);
app.use("/product", productRouter);
mongoose.set("useCreateIndex", true);
mongoose.set("useFindAndModify", false);

async function startApp() {
  try {
    await mongoose.connect(config.get("dbUrl"), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    server.listen(PORT, () => {
      console.log(`Server is Started on ${PORT} PORT`);
    });
  } catch (e) {
    console.log(e);
  }
}

startApp();
