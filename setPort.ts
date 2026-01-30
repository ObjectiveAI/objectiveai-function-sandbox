import { existsSync, readFileSync, writeFileSync, appendFileSync } from "fs";

function getRandomPort(): number {
  // Random port between 10000 and 60000
  return Math.floor(Math.random() * 50000) + 10000;
}

function main(): void {
  const envPath = ".env";
  const port = getRandomPort();

  if (existsSync(envPath)) {
    const content = readFileSync(envPath, "utf-8");
    // Check if PORT is already defined
    if (/^PORT=/m.test(content)) {
      console.log("PORT already defined in .env, skipping");
      return;
    }
    // Append PORT to existing .env
    const newLine = content.endsWith("\n") ? "" : "\n";
    appendFileSync(envPath, `${newLine}PORT=${port}\n`);
    console.log(`Appended PORT=${port} to .env`);
  } else {
    // Create new .env with PORT
    writeFileSync(envPath, `PORT=${port}\n`);
    console.log(`Created .env with PORT=${port}`);
  }
}

main();
