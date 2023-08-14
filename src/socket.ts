import { io } from "socket.io-client";
import { Logger } from "./config";
import * as env from "dotenv";
import { print } from "./printer-module";
env.config();

const room = "private";
const client = process.env.SOCKET_CLIENT;
const domain = process.env.SOCKET_SERVER;
var socket = io(domain);

socket.on("connect", () => {
  socket.emit("room", { room, client });
  Logger.error("Socket client connected.");
});

socket.on("sale", (data: any) => {
  print.receipt(data, (error: any, message: any) => {});
});

socket.on("disconnect", () => {
  Logger.error("Socket client disconnected.");
});
