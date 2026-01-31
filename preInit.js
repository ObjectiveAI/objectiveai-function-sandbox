const { execSync } = require("child_process");
const { existsSync, rmSync } = require("fs");

const SANDBOX_ORIGIN = "https://github.com/ObjectiveAI/objectiveai-function-sandbox";

function exec(command) {
  try {
    return execSync(command, { encoding: "utf-8", stdio: "pipe" }).trim();
  } catch {
    return "";
  }
}

function execLog(command) {
  console.log(`> ${command}`);
  execSync(command, { stdio: "inherit" });
}

function getGitOrigin() {
  return exec("git remote get-url origin");
}

function reinitializeRepo() {
  console.log("Reinitializing repository...");

  // Remove .git and objectiveai directories
  if (existsSync(".git")) {
    rmSync(".git", { recursive: true, force: true });
  }
  if (existsSync("objectiveai")) {
    rmSync("objectiveai", { recursive: true, force: true });
  }

  // Initialize new git repo and add submodule
  execLog("git init");
  execLog("git submodule add https://github.com/ObjectiveAI/objectiveai objectiveai");
  execLog("git submodule update --init --recursive");
  execLog("git add .");
  execLog('git commit -m "Initial commit"');
}

function runNpmInstall() {
  console.log("Installing dependencies...");
  execLog("npm install");
}

// Main
const origin = getGitOrigin();
if (origin === SANDBOX_ORIGIN) {
  reinitializeRepo();
}
runNpmInstall();
