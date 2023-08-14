import "reflect-metadata";
import * as env from "dotenv";
import { Logger } from "./config";
import morgan = require("morgan");
import express = require("express");
import compression from "compression";
var session = require("express-session");
import cookieParser = require("cookie-parser");
import { PrinterDataSource } from "../ormconfig";
import { NextFunction, Request, Response } from "express";
import "./socket"

env.config();
PrinterDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();

    /**Disable server signatures */
    app.disable("x-powered-by");
    app.disable("e-tag");

    // Memory unleaked
    app.set("trust proxy", 1);

    app.use(
      session({
        resave: false,
        secret: "PRINTER_MODULE",
        cookie: {
          // secure: true,
          maxAge: 60000,
        },
        saveUninitialized: true,
      })
    );

    app.use(compression());
    app.use(morgan("dev"));
    app.use(cookieParser("PRINTER_MODULE"));

    app.use((req: Request, res: Response, next: NextFunction) => {
      req.headers.origin = req.headers.origin || req.headers.host;
      // update to match the domain you will make the request from
      res.header("Access-Control-Allow-Origin", "*");
      res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
      );
      next();
    });

    // Unhandled Rejection
    process.on("unhandledRejection", (reason, promise) => {
      Logger.error(reason);
    });

    // Uncaught Exception
    process.on("uncaughtException", (reason) => {
      Logger.error(reason);
    });

    // start express server
    let server: any = app.listen(8081, "0.0.0.0", function () {
      const data: any = server.address();
      Logger.info(
        `PRINTER MODULE INIT AT: http://${data["address"]}:${data["port"]}`
      );
    });
  })
  .catch((error) => Logger.error(error));
