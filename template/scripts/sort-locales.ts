import { readFile, writeFile } from "fs/promises";

const file = "public/locale/en.json";

async function main() {
  const data = JSON.parse(await readFile(file, "utf8"));

  const sortedData = Object.keys(data)
    .sort()
    .reduce((acc: Record<string, string>, key) => {
      acc[key] = data[key];
      return acc;
    }, {});

  await writeFile(file, JSON.stringify(sortedData, null, 2) + "\n");
}

main();
