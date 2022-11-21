import Fastify from "fastify";
import { getDb } from "../../store/db";
import { getConsoleServer } from "../../lib/urls";
import { openInBrowser } from '../../lib/browser';

const portastic = require("portastic");

const consoleServer = getConsoleServer();
const clientId = "7ddcb826-e84a-4102-b95b-d9b8d3a57176";

const fastify = Fastify({
  // no logging to the console
  logger: false,
  //return jwt bigger than default
  maxParamLength: 10000,
});

// we have the jwt, store it
fastify.get("/token/:userId", async (request: any, reply: any) => {
  const userId = request.params.userId;
  const error = request.params.error;
  getDb().set("config.token", userId).write();

  if (error) {
    console.log("Error when attempting to login");
    return;
  }
  console.log(`User returned from ${consoleServer} authenticated`);
  reply.redirect("/complete");
});

fastify.get("/complete", async (request: any, reply: any) => {
  const html = `<!DOCTYPE html>
  <html lang="en">
    <head>
      <style>
        body,
        html {
          margin: 0;
          padding: 0;
          background-color: #fff;
          text-align: center;
          font-family: "Manrope", sans-serif;
          height: 100%;
        }
        .header {
          width: 100%;
          height: 56px;
          background: #20232c;
          display: block;
        }
      </style>
    </head>
    <body>
      <div class="header" style="position: relative">
        <div style="float: left; margin-top: 16px; margin-left: 40px">
          <svg
            width="23"
            height="24"
            viewBox="0 0 23 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M19.7113 4.30809L13.3204 0.617957C11.8908 -0.205986 10.1303 -0.205986 8.7007 0.617957L2.30986 4.30809C0.88028 5.13203 0 6.65667 0 8.30808V15.6919C0 17.3433 0.88028 18.868 2.30986 19.6919L8.7007 23.382C10.1303 24.206 11.8908 24.206 13.3204 23.382L19.7113 19.6919C21.1408 18.868 22.0211 17.3433 22.0211 15.6919V8.30808C22.0211 6.65667 21.1408 5.13203 19.7113 4.30809ZM18.9436 14.5335C18.9436 15.7588 18.3098 16.8574 17.2465 17.4701L12.5598 20.1708C12.0282 20.4771 11.4436 20.6285 10.8627 20.6285C10.2817 20.6285 9.69718 20.4771 9.16549 20.1708C8.30281 19.6743 7.72886 18.8539 7.54224 17.9102C7.19365 18.0299 6.83098 18.0933 6.46831 18.0933C5.8838 18.0933 5.30281 17.9419 4.77112 17.632C3.70774 17.0193 3.07394 15.9208 3.07394 14.6954V9.29049C3.07394 8.06514 3.70774 6.96656 4.77112 6.35388C5.6338 5.85741 6.63027 5.76937 7.54224 6.07923C7.73239 5.13556 8.30281 4.31865 9.16549 3.82217C10.2289 3.2095 11.4965 3.2095 12.5598 3.82217L17.2465 6.52289C18.3098 7.13557 18.9436 8.23415 18.9436 9.4595C18.9436 10.4525 18.5211 11.3574 17.7958 11.9912C18.5211 12.625 18.9436 13.5299 18.9436 14.5264V14.5335Z"
              fill="#D8FD49"
            />
            <path
              d="M10.4472 14.6883L16.1725 11.389L16.5422 11.1777C17.162 10.8221 17.5282 10.1848 17.5282 9.46998C17.5282 8.75519 17.1584 8.11788 16.5422 7.76224L11.8556 5.06153C11.2359 4.70589 10.5 4.70589 9.88028 5.06153C9.26056 5.41716 8.89436 6.05447 8.89436 6.76926V6.78689L14.3063 9.9066C14.6444 10.1038 14.7606 10.5369 14.5669 10.8749C14.4366 11.1038 14.1972 11.2305 13.9507 11.2305C13.831 11.2305 13.7077 11.1988 13.5951 11.1355L7.83098 7.8115C7.83098 7.8115 7.82394 7.80449 7.81689 7.80097L7.46126 7.59672C6.84154 7.24108 6.10563 7.24108 5.48591 7.59672C4.86619 7.95235 4.5 8.58971 4.5 9.3045V14.7094C4.5 15.4207 4.86971 16.058 5.48591 16.4172C6.10563 16.7728 6.84154 16.7728 7.46126 16.4172L7.47534 16.4101V12.0087C7.47534 11.6179 7.79225 11.3009 8.18662 11.3009C8.58098 11.3009 8.89788 11.6179 8.89788 12.0087V16.8186V17.2446C8.89788 17.9559 9.2676 18.5967 9.88379 18.9523C10.5035 19.308 11.2394 19.308 11.8591 18.9523L16.5458 16.2517C17.1655 15.896 17.5317 15.2587 17.5317 14.5439C17.5317 13.8291 17.162 13.1918 16.5458 12.8362L16.5317 12.8291L11.162 15.9242C11.0493 15.9876 10.9296 16.0193 10.8063 16.0193C10.5598 16.0193 10.3204 15.8925 10.1901 15.6636C9.99295 15.3256 10.1092 14.889 10.4507 14.6953L10.4472 14.6883Z"
              fill="#D8FD49"
            />
          </svg>
        </div>
      </div>
      <div
        style="
          display: block;
          position: relative;
          top: 50%;
          transform: translateY(-70%);
        "
      >
        <h1>Authentication Completed</h1>
        <p>You have successfully authenticated with the server.</p>
        <p>You can now close this window.</p>
      </div>
    </body>
  </html>`;
  reply.header("Content-Type", "text/html").send(html);
  setTimeout(() => process.exit(0), 2000);
});

// run the server
const start = async () => {
  try {
    const ports = await portastic.find({ min: 8000, max: 8999 });
    const port = ports[Math.floor(Math.random() * ports.length)];

    // request a jwt from the console ui
    fastify.get("/", async (request, reply) => {
      console.log(`Sending user to ${consoleServer} to authenticate`);

      // the web dev server will be under port 3000, and api under port 3005
      const webServer =
        process.env.NODE_ENV === "development"
          ? getConsoleServer(3000)
          : consoleServer

      reply.redirect(
        `${webServer}/login?returnUrl=http://0.0.0.0:${port}/token&clientId=${clientId}`
      );
    });

    fastify.listen({ port }).then(async () => {
      console.log(`Open Browser at http://0.0.0.0:${port} to complete login`)
      openInBrowser(`http://0.0.0.0:${port}`)
    });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// run the command when cli is called
export function run(code: string[], options?: any) {
  if (options?.authToken) {
    // todo verify token is actually good before setting it
    const token = options?.authToken;
    getDb().set("config.token", token).write();
  } else {
    start();
  }
}
