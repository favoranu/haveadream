const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, "public");
const SUBSCRIBERS_FILE = path.join(__dirname, "subscribers.json");

const MIME = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

function loadSubscribers() {
  try {
    return JSON.parse(fs.readFileSync(SUBSCRIBERS_FILE, "utf8"));
  } catch {
    return [];
  }
}

function saveSubscribers(list) {
  fs.writeFileSync(SUBSCRIBERS_FILE, JSON.stringify(list, null, 2));
}

function sendJson(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

function serveStatic(req, res) {
  let filePath = path.join(PUBLIC_DIR, req.url === "/" ? "index.html" : req.url);

  if (!filePath.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { error: "Forbidden" });
    return;
  }

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/subscribe") {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1e4) req.destroy();
    });
    req.on("end", () => {
      let parsed;
      try {
        parsed = JSON.parse(body);
      } catch {
        sendJson(res, 400, { error: "Invalid request body." });
        return;
      }

      const email = (parsed.email || "").trim().toLowerCase();
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email || !emailRe.test(email)) {
        sendJson(res, 400, { error: "Please provide a valid email address." });
        return;
      }

      const subscribers = loadSubscribers();
      if (subscribers.some((s) => s.email === email)) {
        sendJson(res, 409, { error: "This email is already subscribed." });
        return;
      }

      subscribers.push({ email, subscribedAt: new Date().toISOString() });
      saveSubscribers(subscribers);
      sendJson(res, 201, { success: true, message: "Subscribed successfully." });
    });
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed." });
});

server.listen(PORT, () => {
  console.log(`HAD landing page running at http://localhost:${PORT}`);
});