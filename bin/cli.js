#!/usr/bin/env node

import prompts from "prompts";
import chalk from "chalk";
import path from "path";
import { initProject } from "../src/init.js";
import { validateProjectName, validatePort } from "../src/utils.js";

async function main() {
  console.log(chalk.bold.cyan("\n🏥 Create Care FE Plugin\n"));

  // Get project name from command line argument or prompt
  let projectName = process.argv[2];

  if (!projectName) {
    const response = await prompts({
      type: "text",
      name: "projectName",
      message: "What is your project name?",
      validate: (value) => {
        const validation = validateProjectName(value);
        return validation === true ? true : validation;
      },
    });

    if (!response.projectName) {
      console.log(chalk.red("\n❌ Project creation cancelled.\n"));
      process.exit(1);
    }

    projectName = response.projectName;
  } else {
    // Validate project name from command line
    const validation = validateProjectName(projectName);
    if (validation !== true) {
      console.error(chalk.red(`\n❌ Error: ${validation}\n`));
      process.exit(1);
    }
  }

  // Prompt for port number
  const portResponse = await prompts({
    type: "number",
    name: "port",
    message: "What port should the dev server run on?",
    initial: 10120,
    validate: (value) => {
      const validation = validatePort(value);
      return validation === true ? true : validation;
    },
  });

  if (!portResponse.port) {
    console.log(chalk.red("\n❌ Project creation cancelled.\n"));
    process.exit(1);
  }

  const port = portResponse.port;

  // Determine target directory
  const targetDir = path.resolve(process.cwd(), projectName);

  try {
    await initProject(projectName, port, targetDir);
  } catch (error) {
    console.error(chalk.red(`\n❌ Error: ${error.message}\n`));
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(chalk.red(`\n❌ Unexpected error: ${error.message}\n`));
  process.exit(1);
});
