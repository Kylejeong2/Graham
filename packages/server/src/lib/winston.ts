import winston from "winston";
import { WinstonTransport } from "@axiomhq/winston";

const winstonFormat = winston.format.combine(
  winston.format.json(),
  winston.format.errors({ stack: true }),
);

const alignColorsAndTime = winston.format.combine(
  winston.format.colorize({
    all: true,
  }),
  winston.format.timestamp({
    format: "YY-MM-DD HH:mm:ss",
  }),
);

const consoleTransport = new winston.transports.Console({
  format:
    process.env.NODE_ENV == "production"
      ? undefined
      : winston.format.combine(winston.format.colorize(), alignColorsAndTime),
});

const axiomTransport = new WinstonTransport({
  dataset: process.env.AXIOM_DATASET!,
  // token: process.env.AXIOM_TOKEN!,
  token: "xaat-ff391492-8ca2-4c8d-ab1e-fe6ff7f6a7c8",
});

const transports =
  process.env.NODE_ENV == "production"
    ? [consoleTransport, axiomTransport]
    : [consoleTransport];
  
export const serverLogger = winston.createLogger({
  format: winstonFormat,
  levels: {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    trace: 4,
    debug: 5,
  },
  transports,
});