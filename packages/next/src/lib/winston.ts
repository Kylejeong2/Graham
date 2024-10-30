// TODO: build logging for user actions 
// import winston from "winston";
// import { WinstonTransport } from "@axiomhq/winston";

// let winstonFormat = winston.format.json();
// if (process.env.NODE_ENV == "development") {
//   winstonFormat = winston.format.combine(
//     winston.format.json(),
//     winston.format.prettyPrint(),
//   );
// }

// export const nextLogger = winston.createLogger({
//   level: "info",
//   format: winstonFormat,
//   levels: {
//     fatal: 0,
//     error: 1,
//     warn: 2,
//     info: 3,
//     trace: 4,
//     debug: 5,
//   },
//   transports: [
//     new winston.transports.Console(),
//     new WinstonTransport({
//       dataset: env.NEXT_PUBLIC_AXIOM_DATASET,
//       token: env.NEXT_PUBLIC_AXIOM_TOKEN,
//     }),
//   ],
// });