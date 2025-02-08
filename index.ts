import path from "path";

const clients = new Set();

const server = Bun.serve({
  hostname: "0.0.0.0",
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);
    // console.log(server.requestIP(req));

    if (url.pathname === "/ws") {
      const success = upgrade(req);
      return success
        ? undefined
        : new Response("WebSocket upgrade failed", { status: 400 });
    }
    // Serve Static Files
    let filePath = path.join(import.meta.dir, "./static", url.pathname);
    
    if (url.pathname === "/") {
      filePath = path.join(import.meta.dir, "./static", "index.html");
    }

    try {
      const file = Bun.file(filePath);
      const contentType = getContentType(filePath);
      return new Response(file, { headers: { "Content-Type": contentType } });
    } catch {
      return new Response("404 Not Found 😵 Error", { status: 404 });
    }

  },
  websocket: {

    async message(ws, message) {
      const msg = JSON.stringify(JSON.parse(message));
    //   Bun.write(Bun.stdout, msg);
      console.log(msg);

    //   sending ACK to calc round trip latency
      ws.send(JSON.stringify({ msg: "👍" }));
    },

    open(ws) {
      clients.add(ws);
      console.log("Client connected");
      ws.send(
        JSON.stringify({msg: "Welcome to WebSocket Server!"})
      );
    },

    close(ws) {
      clients.delete(ws);
      console.log("Client disconnected");
    },
  },
});

function getContentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return (
    {
      ".html": "text/html",
      ".css": "text/css",
      ".js": "application/javascript",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".gif": "image/gif",
      ".svg": "image/svg+xml",
      ".json": "application/json",
    }[ext] || "application/octet-stream"
  );
}

function upgrade(req) {
  const success = server.upgrade(req);
  return success;
}

// console.log(`Listening on ${server.hostname}:${server.port}`);
