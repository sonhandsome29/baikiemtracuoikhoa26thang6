const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = process.env.PORT || 5173;
const ROOT_DIR = __dirname;
const PUBLIC_DIR = path.join(ROOT_DIR, "public");

const MIME_TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
};

function sendText(response, statusCode, text) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
  });
  response.end(text);
}

async function sendStaticFile(response, requestPath) {
  const normalizedPath = requestPath === "/" ? "/index.html" : requestPath;
  const absolutePath = path.join(PUBLIC_DIR, normalizedPath);
  const resolvedPath = path.resolve(absolutePath);

  if (!resolvedPath.startsWith(PUBLIC_DIR)) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(resolvedPath);
    const extension = path.extname(resolvedPath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
    });
    response.end(content);
  } catch {
    sendText(response, 404, "Not Found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    await sendStaticFile(response, request.url || "/");
  } catch (error) {
    console.error(error);
    sendText(response, 500, "Internal Server Error");
  }
});

server.listen(PORT, () => {
  console.log(`Teacher management frontend is running at http://localhost:${PORT}`);
});
