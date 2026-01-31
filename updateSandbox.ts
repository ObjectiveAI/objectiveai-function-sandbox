import { execSync } from "child_process";
import {
  mkdtempSync,
  rmSync,
  readdirSync,
  statSync,
  copyFileSync,
  mkdirSync,
  existsSync,
} from "fs";
import { join } from "path";
import { tmpdir } from "os";

// The sandbox repo URL (template repository)
const SANDBOX_REPO =
  "https://github.com/AviCrawororth/objectiveai-function-sandbox.git";

// Files that should NOT be replaced (user-editable files)
const PRESERVE_FILES = new Set([
  "repository.json",
  "README.md",
  "profile.json",
  "profile.ts",
  "function.json",
  "function.ts",
  "inputs.ts",
  ".claude/plans/function.md",
  ".claude/plans/mode.md",
]);

// Directories to skip entirely
const SKIP_DIRECTORIES = new Set(["objectiveai", ".git", "node_modules"]);

function checkoutSubmodule(): void {
  console.log("Checking out objectiveai submodule changes (to clean state)...");
  execSync("git -C objectiveai checkout .", { stdio: "inherit" });
}

function cloneSandbox(): string {
  const tempDir = mkdtempSync(join(tmpdir(), "sandbox-"));
  console.log(`Cloning sandbox repo to ${tempDir}...`);
  execSync(`git clone --depth 1 ${SANDBOX_REPO} "${tempDir}"`, {
    stdio: "inherit",
  });
  return tempDir;
}

function copyFiles(
  srcDir: string,
  destDir: string,
  basePath: string = "",
): void {
  const entries = readdirSync(srcDir);

  for (const entry of entries) {
    const srcPath = join(srcDir, entry);
    const relativePath = basePath ? join(basePath, entry) : entry;
    const destPath = join(destDir, entry);

    // Skip directories we shouldn't touch
    if (SKIP_DIRECTORIES.has(entry)) {
      console.log(`Skipping directory: ${relativePath}`);
      continue;
    }

    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively handle directories
      if (!existsSync(destPath)) {
        mkdirSync(destPath, { recursive: true });
      }
      copyFiles(srcPath, destPath, relativePath);
    } else if (stat.isFile()) {
      // Check if this file should be preserved
      const normalizedPath = relativePath.replace(/\\/g, "/");
      if (PRESERVE_FILES.has(normalizedPath)) {
        console.log(`Preserving: ${relativePath}`);
        continue;
      }

      // Copy the file
      console.log(`Updating: ${relativePath}`);
      const destDirPath = join(destDir, "..");
      if (!existsSync(join(destDir, ".."))) {
        mkdirSync(destDirPath, { recursive: true });
      }
      copyFileSync(srcPath, destPath);
    }
  }
}

function updateSubmodule(): void {
  console.log("Updating git submodule...");
  execSync("git submodule update --init --recursive", { stdio: "inherit" });
}

function cleanup(tempDir: string): void {
  console.log("Cleaning up temp directory...");
  rmSync(tempDir, { recursive: true, force: true });
}

function main(): void {
  const cwd = process.cwd();

  // Step 1: Checkout submodule to clean state
  checkoutSubmodule();

  // Step 2: Clone sandbox repo
  const tempDir = cloneSandbox();

  try {
    // Step 3: Copy files (excluding preserved ones and submodule)
    console.log("\nCopying files from sandbox...");
    copyFiles(tempDir, cwd);

    // Step 4: Update git submodule
    console.log("\n");
    updateSubmodule();

    console.log("\nSandbox update complete!");
  } finally {
    // Always cleanup temp directory
    cleanup(tempDir);
  }
}

main();
