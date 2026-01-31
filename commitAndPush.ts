import { execSync } from "child_process";
import repository from "./repository.json";

function validateRepository(): void {
  if (
    typeof repository.repository !== "string" ||
    repository.repository.trim() === ""
  ) {
    throw new Error(
      "Invalid repository.json: 'repository' must be a non-empty string"
    );
  }
  if (
    typeof repository.repositoryDescription !== "string" ||
    repository.repositoryDescription.trim() === ""
  ) {
    throw new Error(
      "Invalid repository.json: 'repositoryDescription' must be a non-empty string"
    );
  }
}

function getCommitMessage(): string {
  const args = process.argv.slice(2);
  const messageIndex = args.findIndex((arg) => arg === "-m" || arg === "--message");

  if (messageIndex === -1 || messageIndex + 1 >= args.length) {
    throw new Error(
      "Missing commit message. Usage: ts-node commitAndPush.ts -m \"Your commit message\""
    );
  }

  const message = args[messageIndex + 1];
  if (typeof message !== "string" || message.trim() === "") {
    throw new Error("Commit message must be a non-empty string");
  }

  return message;
}

function shouldSkipCheckout(): boolean {
  const args = process.argv.slice(2);
  return args.includes("--skip-checkout");
}

function checkoutSubmodule(): void {
  console.log("Checking out objectiveai submodule changes...");
  execSync("git -C objectiveai checkout .", { stdio: "inherit" });
}

function getCurrentRemoteRepo(): string | null {
  try {
    const remoteUrl = execSync("git remote get-url origin", {
      encoding: "utf-8",
    }).trim();

    // Handle SSH format: git@github.com:owner/repo.git
    const sshMatch = remoteUrl.match(/git@[^:]+:[^/]+\/(.+?)(?:\.git)?$/);
    if (sshMatch) {
      return sshMatch[1];
    }

    // Handle HTTPS format: https://github.com/owner/repo.git
    const httpsMatch = remoteUrl.match(/https?:\/\/[^/]+\/[^/]+\/(.+?)(?:\.git)?$/);
    if (httpsMatch) {
      return httpsMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}

function stageAndCommit(message: string): void {
  console.log("Staging all changes...");
  execSync("git add -A", { stdio: "inherit" });

  console.log("Creating commit...");
  // Use a simple approach - escape double quotes in the message
  const escapedMessage = message.replace(/"/g, '\\"');
  execSync(`git commit -m "${escapedMessage}"`, { stdio: "inherit" });
}

function createGitHubRepo(): void {
  const repoName = repository.repository;
  const description = repository.repositoryDescription;

  console.log(`Creating GitHub repository: ${repoName}`);
  // Escape double quotes in description
  const escapedDescription = description.replace(/"/g, '\\"');
  execSync(
    `gh repo create ${repoName} --public --description "${escapedDescription}" --source=. --push`,
    { stdio: "inherit" }
  );
}

function push(): void {
  console.log("Pushing to remote...");
  execSync("git push", { stdio: "inherit" });
}

function main(): void {
  // Validate inputs
  validateRepository();
  const commitMessage = getCommitMessage();
  const skipCheckout = shouldSkipCheckout();

  // Checkout submodule changes (unless skipped)
  if (!skipCheckout) {
    checkoutSubmodule();
  } else {
    console.log("Skipping submodule checkout...");
  }

  // Stage and commit changes
  stageAndCommit(commitMessage);

  // Check if remote matches expected repository name
  const currentRepo = getCurrentRemoteRepo();
  const expectedRepo = repository.repository;

  if (currentRepo !== expectedRepo) {
    console.log(
      `Current remote repo "${currentRepo}" does not match expected "${expectedRepo}"`
    );
    createGitHubRepo();
  } else {
    console.log(`Remote repository "${expectedRepo}" already exists`);
    push();
  }

  console.log("Done!");
}

main();
