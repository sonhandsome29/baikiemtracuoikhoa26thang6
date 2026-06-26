const teacherService = require("../services/teacherService");
const { parseRequestBody, sendJson } = require("../utils/http");

async function handleTeacherRoutes(request, response, requestUrl) {
  const pathname = requestUrl.pathname;

  if (request.method === "GET" && pathname === "/teachers") {
    const payload = await teacherService.listTeachers(requestUrl.searchParams);
    sendJson(response, 200, payload);
    return true;
  }

  if (request.method === "POST" && pathname === "/teachers") {
    let body;

    try {
      body = await parseRequestBody(request);
    } catch {
      sendJson(response, 400, { message: "Payload JSON khong hop le." });
      return true;
    }

    const result = await teacherService.createTeacher(body);
    if (result.error) {
      sendJson(response, 400, { message: result.error });
      return true;
    }

    sendJson(response, 201, result);
    return true;
  }

  if (request.method === "GET" && pathname.startsWith("/teachers/")) {
    const id = pathname.split("/").pop();
    const teacher = await teacherService.getTeacherDetail(id);

    if (!teacher) {
      sendJson(response, 404, { message: "Khong tim thay giao vien." });
      return true;
    }

    sendJson(response, 200, { data: teacher });
    return true;
  }

  return false;
}

module.exports = {
  handleTeacherRoutes,
};
