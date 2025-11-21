# create-care-mfe-plug

CLI tool to scaffold Care FE plugins quickly and easily.

## Usage

### Using npx (Recommended)

```bash
npx create-care-mfe-plug my-plugin-name
```

### Using npm

```bash
npm install -g create-care-mfe-plug
create-care-mfe-plug my-plugin-name
```

### Interactive Mode

If you don't provide a project name, the CLI will prompt you for one:

```bash
npx create-care-mfe-plug
```

## What it does

The CLI will:

1. **Prompt for project name** - If not provided as an argument
2. **Prompt for port number** - Default is 10120
3. **Create a new directory** with your project name
4. **Copy the template** files
5. **Configure the project** with proper name transformations:
   - **Package name**: Uses your input as-is (e.g., "MyPlugin")
   - **Vite federation name**: Converts to snake_case (e.g., "my_plugin")
   - **Plugin manifest**: Converts to kebab-case (e.g., "my-plugin")
6. **Set the port number** in the Vite config

## Example

```bash
$ npx create-care-mfe-plug care-patient-vitals

🏥 Create Care FE Plugin

✔ What port should the dev server run on? … 10120

🚀 Creating new Care FE plugin...

📁 Copying template files...
🔧 Configuring project...

✅ Project created successfully!

Next steps:

  cd care-patient-vitals
  npm install
  npm start

  Your plugin will be available at http://localhost:10120
```

## Project Structure

The generated project includes:

- **React 19** with TypeScript
- **Vite** for build tooling
- **Module Federation** for plugin architecture
- **TailwindCSS** for styling
- **Radix UI** components
- **React Query** for data fetching
- **i18next** for internationalization
- **ESLint & Prettier** for code quality
- **Husky** for git hooks

## Requirements

- Node.js >= 18.0.0
- npm or yarn

## Development

After creating your plugin:

```bash
cd your-plugin-name
npm install
npm start
```

Your plugin will be available at the port you specified during setup.

## Building for Production

```bash
npm run build
```

## License

MIT
