/**
 * Convert a string to kebab-case
 * Example: "MyPlugin" -> "my-plugin"
 */
export function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

/**
 * Convert a string to snake_case
 * Example: "MyPlugin" -> "my_plugin"
 */
export function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toLowerCase();
}

/**
 * Validate project name according to npm package name rules
 * @param {string} name - The project name to validate
 * @returns {boolean|string} - true if valid, error message if invalid
 */
export function validateProjectName(name) {
  if (!name || name.trim() === "") {
    return "Project name cannot be empty";
  }

  if (name.length > 214) {
    return "Project name must be less than 214 characters";
  }

  if (name.startsWith(".") || name.startsWith("_")) {
    return "Project name cannot start with . or _";
  }

  if (name !== name.toLowerCase() && !/^[A-Z]/.test(name)) {
    return "Project name should be lowercase or PascalCase";
  }

  if (!/^[a-zA-Z0-9._-]+$/.test(name)) {
    return "Project name can only contain letters, numbers, hyphens, underscores, and dots";
  }

  const blacklistedNames = ["node_modules", "favicon.ico"];
  if (blacklistedNames.includes(name.toLowerCase())) {
    return `Project name "${name}" is not allowed`;
  }

  return true;
}

/**
 * Validate port number
 * @param {number|string} port - The port number to validate
 * @returns {boolean|string} - true if valid, error message if invalid
 */
export function validatePort(port) {
  const portNum = parseInt(port, 10);

  if (isNaN(portNum)) {
    return "Port must be a number";
  }

  if (portNum < 1024 || portNum > 65535) {
    return "Port must be between 1024 and 65535";
  }

  return true;
}
