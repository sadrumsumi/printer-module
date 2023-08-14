import * as fs from "fs";
import * as dotenv from "dotenv";
import { createLogger, format, transports } from "winston";

dotenv.config();

const env: any = process.env.NODE_ENV;
const logDir: string = "logs";

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const now: any = new Date();
const logLevel: any = "info";

let logger: any = createLogger({
  level: logLevel,
  format: format.combine(
    format.prettyPrint(),
    format.timestamp({
      format: "DD-MM-YYYY hh:mm:ss A",
    }),
    format.printf((nfo) => {
      return `${nfo.timestamp} - [${nfo.level}]: ${nfo.message}`;
    })
  ),
  transports: [
    new transports.Console(),
    new transports.File({
      filename: `${logDir}/app.log`,
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
      tailable: true,
    }),
    new transports.File({
      filename: `${logDir}/error.log`,
      level: "error",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 2,
      tailable: true,
    }),
  ],
});

// Extend logger object to properly log 'Error' types
let origLog: any = logger.log;

logger.log = function (level: any, msg: any) {
  if (msg instanceof Error) {
    let args = Array.prototype.slice.call(arguments);
    args[1] = msg.stack;
    origLog.apply(logger, args);
  } else {
    origLog.apply(logger, arguments);
  }
};

export { logger as Logger };
