const express = require("express")
const { GracefulShutdownServer } = require("medusa-core-utils")
const tenantMiddleware = require("./middlewares/tenant-middleware");
const loaders = require("@medusajs/medusa/dist/loaders/index").default

  ; (async () => {
    async function start() {
      const app = express()
      const directory = process.cwd()

      console.log("directory", directory);
      
      app.use(tenantMiddleware);
      try {
        const { container } = await loaders({
          directory,
          expressApp: app
        })
        const configModule = container.resolve("configModule")
        const port = process.env.PORT ?? configModule.projectConfig.port ?? 9000

        const server = GracefulShutdownServer.create(
          app.listen(port, (err) => {
            if (err) {
              return
            }
            console.log(`Server is ready on port: ${port}`)
          })
        )

        // Handle graceful shutdown
        const gracefulShutDown = () => {
          server
            .shutdown()
            .then(() => {
              console.info("Gracefully stopping the server.")
              process.exit(0)
            })
            .catch((e) => {
              console.error("Error received when shutting down the server.", e)
              process.exit(1)
            })
        }
        process.on("SIGTERM", gracefulShutDown)
        process.on("SIGINT", gracefulShutDown)
      } catch (err) {
        console.error("Error starting server", err)
        process.exit(1)
      }
    }

    await start()
  })()

// const express = require("express");
// const { GracefulShutdownServer } = require("medusa-core-utils");
// const loaders = require("@medusajs/medusa/dist/loaders/index").default;
// const tenantMiddleware = require("./middlewares/tenant-middleware");

// (async () => {
//   async function start() {
//     const app = express();
//     const directory = process.cwd();

//     // Apply the tenant middleware
//     app.use(tenantMiddleware);

//     // Override the Medusa loader to use the tenant-specific database URL
//     app.use(async (req, res, next) => {
//       try {
//         const { container } = await loaders({
//           directory,
//           expressApp: app,
//           configModuleOverride: {
//             projectConfig: {
//               database_url: req.tenantDatabaseUrl,
//               database_client: "pg",
//             },
//           },
//         });

//         const configModule = container.resolve("configModule");
//         const port = process.env.PORT ?? configModule.projectConfig.port ?? 9000;

//         const server = GracefulShutdownServer.create(
//           app.listen(port, (err) => {
//             if (err) {
//               return;
//             }
//             console.log(`Server is ready on port: ${port}`);
//           })
//         );

//         // Handle graceful shutdown
//         const gracefulShutDown = () => {
//           server
//             .shutdown()
//             .then(() => {
//               console.info("Gracefully stopping the server.");
//               process.exit(0);
//             })
//             .catch((e) => {
//               console.error("Error received when shutting down the server.", e);
//               process.exit(1);
//             });
//         };

//         process.on("SIGTERM", gracefulShutDown);
//         process.on("SIGINT", gracefulShutDown);

//         next();
//       } catch (err) {
//         console.error("Error starting server", err);
//         process.exit(1);
//       }
//     });
//   }

//   await start();
// })();
