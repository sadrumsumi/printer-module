require("dotenv").config();
import { join } from "path";
import { DataSource } from "typeorm";

export const PrinterDataSource = new DataSource({
  type: "sqlite",
  dropSchema: false,
  synchronize: true,
  database: "printer",
  migrationsRun: false,
  logging: ["warn", "error"],
  extra: { ssl: false },
  entities: [join(__dirname, "src/entities/*{.ts,.js}")],
  migrations: [join(__dirname, "src/migrations/*{.ts,.js}")],
  logger: process.env.NODE_ENV === "production" ? "file" : "debug",
});
