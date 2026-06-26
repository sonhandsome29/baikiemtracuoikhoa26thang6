const { PORT, DATABASE_NAME } = require("./src/config");
const { server, storageService } = require("./src/app");

process.on("SIGINT", async () => {
  await storageService.close();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await storageService.close();
  process.exit(0);
});

async function startServer() {
  await storageService.init();

  server.listen(PORT, () => {
    const storageLabel =
      storageService.mode === "mongo"
        ? `MongoDB Atlas (${DATABASE_NAME})`
        : "local JSON files";

    console.log(
      `Teacher management app is running at http://localhost:${PORT} using ${storageLabel}`
    );
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
