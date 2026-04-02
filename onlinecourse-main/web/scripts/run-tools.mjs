import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const action = process.argv[2];
if (!action) {
  console.error("Usage: node scripts/run-tools.mjs <dev|build|start|lint>");
  process.exit(1);
}
const forwardedArgs = process.argv.slice(3);

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const webDir = path.resolve(scriptsDir, "..");

process.chdir(webDir);

function bin(name) {
  const suffix = process.platform === "win32" ? ".cmd" : "";
  return path.join(webDir, "node_modules", ".bin", `${name}${suffix}`);
}

let file;
let args = [];

switch (action) {
  case "dev":
  case "start":
    file = bin("next");
    args = [action, ...forwardedArgs];
    break;
  case "build":
    file = bin("next");
    args = [action];
    break;
  case "lint":
    file = bin("eslint");
    args = [...forwardedArgs];
    break;
  default:
    console.error(`Unknown action: ${action}`);
    process.exit(1);
}

const child = spawn(file, args, {
  stdio: "inherit",
  shell: true,
});

child.on("exit", (code) => process.exit(code ?? 1));
child.on("error", (err) => {
  console.error(err);
  process.exit(1);
});
