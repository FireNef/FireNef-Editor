import { app, protocol } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { BASE_DIR } from "./basePaths.js";

protocol.registerSchemesAsPrivileged([
    {
        scheme: "firenef",
        privileges: {
            standard: true,
            secure: true,
            supportFetchAPI: true,
            corsEnabled: true
        }
    }
]);

app.whenReady().then(() => {
    protocol.handle("firenef", async (request) => {
        try {
            const url = new URL(request.url);

            const relativePath = path.join(url.host, url.pathname);

            const filePath = path.join(BASE_DIR, relativePath);

            if (!filePath.startsWith(BASE_DIR)) {
                return new Response("Forbidden", { status: 403 });
            }

            if (!fs.existsSync(filePath)) {
                return new Response("Not Found", { status: 404 });
            }

            const data = await fs.promises.readFile(filePath);

            return new Response(data, {
                status: 200,
                headers: {
                    "Content-Type": "text/javascript"
                }
            });
        } catch (err) {
            console.error("Protocol error:", err);
            return new Response("Internal Error", { status: 500 });
        }
    });
});
