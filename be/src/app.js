const http = require("http");
const { DATABASE_NAME } = require("./config");
const storageService = require("./services/storageService");
const { handleTeacherRoutes } = require("./routes/teachers");
const { handleTeacherPositionRoutes } = require("./routes/teacherPositions");
const { handleCors, sendJson } = require("./utils/http");

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);

  if (handleCors(request, response)) {
    return;
  }

  try {
    if (request.method === "GET" && requestUrl.pathname === "/") {
      sendJson(response, 200, {
        message: "Teacher Management Backend is running.",
        storage: storageService.mode,
        databaseName: DATABASE_NAME,
      });
      return;
    }

    if (await handleTeacherRoutes(request, response, requestUrl)) {
      return;
    }

    if (await handleTeacherPositionRoutes(request, response, requestUrl)) {
      return;
    }

    sendJson(response, 404, { message: "Route khong ton tai." });
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { message: "Da xay ra loi noi bo server." });
  }
});

module.exports = {
  server,
  storageService,
};
