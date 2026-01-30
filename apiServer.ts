import { ChildProcess, spawn } from "child_process";
import { ObjectiveAI } from "objectiveai";
import { writeFile } from "fs/promises";
import { createWriteStream } from "fs";
import "dotenv/config";

const Port = Math.floor(Math.random() * 50000) + 10000;

export function spawnApiServer(): Promise<ChildProcess | null> {
  if (process.env.ONLY_SET_IF_YOU_KNOW_WHAT_YOURE_DOING) {
    return Promise.resolve(null);
  }

  return new Promise(async (resolve, reject) => {
    // refresh serverLog.txt file
    await writeFile("serverLog.txt", "");
    const logStream = createWriteStream("serverLog.txt", { flags: "a" });

    const apiProcess = spawn(
      "cargo",
      ["run", "--manifest-path", "./objectiveai/objectiveai-api/Cargo.toml"],
      {
        detached: false,
        stdio: ["inherit", "pipe", "pipe"],
        env: {
          ...process.env,
          PORT: Port.toString(),
        },
      },
    );

    const killApiProcess = () => {
      if (!apiProcess.killed) {
        try {
          process.kill(apiProcess.pid as number);
        } catch {}
      }
    };

    process.on("exit", killApiProcess);
    process.on("SIGINT", () => {
      killApiProcess();
      process.exit(130);
    });
    process.on("SIGTERM", () => {
      killApiProcess();
      process.exit(143);
    });
    process.on("uncaughtException", (err) => {
      killApiProcess();
      throw err;
    });
    process.on("unhandledRejection", (err) => {
      killApiProcess();
      throw err;
    });

    let resolved = false;
    const timeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        killApiProcess();
        reject(
          new Error("Timeout: API server did not start within 300 seconds"),
        );
      }
    }, 300000);

    const onData = (data: Buffer) => {
      const output = data.toString();
      logStream.write(output);
      if (!resolved && output.includes("Running `")) {
        resolved = true;
        clearTimeout(timeout);
        resolve(apiProcess);
      }
    };

    apiProcess.stdout?.on("data", onData);
    apiProcess.stderr?.on("data", onData);

    apiProcess.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(err);
      }
    });

    apiProcess.on("exit", (code) => {
      if (!resolved) {
        resolved = true;
        clearTimeout(timeout);
        reject(
          new Error(
            `API server exited with code ${code} before becoming ready`,
          ),
        );
      }
    });
  });
}

export const LocalObjectiveAI = new ObjectiveAI({
  apiBase:
    process.env.ONLY_SET_IF_YOU_KNOW_WHAT_YOURE_DOING ??
    `http://${process.env.ADDRESS ?? "localhost"}:${Port}`,
});
