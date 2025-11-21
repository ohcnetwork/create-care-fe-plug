import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import chalk from "chalk";
import { toKebabCase, toSnakeCase } from "./utils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Replace placeholders in file content
 */
function replacePlaceholders(content, replacements) {
  let result = content;
  for (const [placeholder, value] of Object.entries(replacements)) {
    result = result.replace(new RegExp(placeholder, "g"), value);
  }
  return result;
}

/**
 * Process a file by replacing placeholders
 */
async function processFile(filePath, replacements) {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const newContent = replacePlaceholders(content, replacements);
    await fs.writeFile(filePath, newContent, "utf8");
  } catch (error) {
    // Skip binary files or files that can't be read as text
    if (error.code !== "EISDIR") {
      console.warn(chalk.yellow(`Warning: Could not process ${filePath}`));
    }
  }
}

/**
 * Recursively process all files in a directory
 */
async function processDirectory(
  dirPath,
  replacements,
  excludeDirs = ["node_modules", ".git"]
) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!excludeDirs.includes(entry.name)) {
        await processDirectory(fullPath, replacements, excludeDirs);
      }
    } else {
      await processFile(fullPath, replacements);
    }
  }
}

/**
 * Initialize a new Care FE plugin project
 */
export async function initProject(projectName, port, targetDir) {
  const projectNameKebab = toKebabCase(projectName);
  const projectNameSnake = toSnakeCase(projectName);

  console.log(chalk.blue("\n🚀 Creating new Care FE plugin...\n"));

  // Get template directory path
  const templateDir = path.join(__dirname, "..", "template");

  // Check if template exists
  if (!(await fs.pathExists(templateDir))) {
    throw new Error(`Template directory not found at ${templateDir}`);
  }

  // Check if target directory already exists
  if (await fs.pathExists(targetDir)) {
    throw new Error(
      `Directory ${targetDir} already exists. Please choose a different name or remove the existing directory.`
    );
  }

  try {
    // Copy template to target directory
    console.log(chalk.gray(`📁 Copying template files...`));
    await fs.copy(templateDir, targetDir, {
      filter: (src) => {
        // Exclude node_modules and package-lock.json from template
        const relativePath = path.relative(templateDir, src);
        return (
          !relativePath.includes("node_modules") &&
          !relativePath.endsWith("package-lock.json")
        );
      },
    });

    // Define replacements
    const replacements = {
      "{{PROJECT_NAME}}": projectName,
      "{{PROJECT_NAME_KEBAB}}": projectNameKebab,
      "{{PROJECT_NAME_SNAKE}}": projectNameSnake,
      "{{PORT}}": port.toString(),
    };

    // Process all files in the target directory
    console.log(chalk.gray(`🔧 Configuring project...`));
    await processDirectory(targetDir, replacements);

    // Success message
    console.log(chalk.green("\n✅ Project created successfully!\n"));
    console.log(chalk.bold("Next steps:\n"));
    console.log(chalk.cyan(`  cd ${path.basename(targetDir)}`));
    console.log(chalk.cyan(`  npm install`));
    console.log(chalk.cyan(`  npm start`));
    console.log(
      chalk.gray(
        `\n  Your plugin will be available at http://localhost:${port}\n`
      )
    );
  } catch (error) {
    // Clean up on error
    if (await fs.pathExists(targetDir)) {
      await fs.remove(targetDir);
    }
    throw error;
  }
}
