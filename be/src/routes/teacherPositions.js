const teacherPositionService = require("../services/teacherPositionService");
const { parseRequestBody, sendJson } = require("../utils/http");

async function handleTeacherPositionRoutes(request, response, requestUrl) {
  const pathname = requestUrl.pathname;

  if (request.method === "GET" && pathname === "/teacher-positions") {
    const positions = await teacherPositionService.listTeacherPositions();
    sendJson(response, 200, { data: positions });
    return true;
  }

  if (request.method === "POST" && pathname === "/teacher-positions") {
    let body;

    try {
      body = await parseRequestBody(request);
    } catch {
      sendJson(response, 400, { message: "Payload JSON khong hop le." });
      return true;
    }

    const result = await teacherPositionService.createTeacherPosition(body);
    if (result.error) {
      sendJson(response, 400, { message: result.error });
      return true;
    }

    sendJson(response, 201, result);
    return true;
  }

  return false;
}

module.exports = {
  handleTeacherPositionRoutes,
};
