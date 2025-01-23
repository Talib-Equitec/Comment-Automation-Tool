import fs from "fs/promises";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config(); 

const openaiApiKey = process.env.API_KEY;
if (!openaiApiKey) {
  console.error("Error: API_KEY not found in environment variables.");
  process.exit(1);
}

const openai = new OpenAI({ apiKey: openaiApiKey });

const containsCSharpClass = (content) => /class\s+\w+\s*{/.test(content);
const hasXmlComments = (content) => /\/\/\/ <summary>/.test(content);

async function generateComments(code) {
  const prompt = `${process.env.PROMPT_AI}\n${code}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });
    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("Error with OpenAI request:", error.message);
    return null;
  }
}

async function processFile(filePath) {
  console.time(`Processing time for ${filePath}`);
  try {
    const code = await fs.readFile(filePath, "utf-8");

    if (!containsCSharpClass(code)) {
      console.log(`Skipping file: ${filePath} (no class found)`);
      return;
    }
    if (hasXmlComments(code)) {
      console.log(`Skipping file: ${filePath} (existing comments found)`);
      return;
    }

    const commentedCode = await generateComments(code);
    if (commentedCode && commentedCode !== code) {
      await fs.writeFile(filePath, commentedCode, "utf-8");
      console.log(`Updated file: ${filePath}`);
    } else {
      console.log(`No changes made to file: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing file (${filePath}):`, error.message);
  } finally {
    console.timeEnd(`Processing time for ${filePath}`);
  }
}

async function processFilesInBatches(files, directoryPath, batchSize) {
  for (let i = 0; i < files.length; i += batchSize) {
    const batchFiles = files.slice(i, i + batchSize);
    console.log(`Processing batch ${Math.ceil((i + 1) / batchSize)}...`);

    await Promise.all(
      batchFiles.map(async (file) => {
        const filePath = path.join(directoryPath, file);
        const stats = await fs.stat(filePath);
        if (stats.isFile()) {
          await processFile(filePath);
        }
      })
    );
  }
  console.log("All batches processed successfully.");
}

async function processDirectory(directoryPath, batchSize = 5) {
  try {
    const files = (await fs.readdir(directoryPath)).filter(
      (file) => file.endsWith(".cs") && !file.includes(".designer.cs")
    );

    console.log(`Found ${files.length} valid .cs files.`);

    if (files.length > 0) {
      await processFilesInBatches(files, directoryPath, batchSize);
    } else {
      console.log("No valid .cs files found in the directory.");
    }
  } catch (error) {
    console.error("Error reading directory:", error.message);
  }
}

(async () => {
  try {
    const directoryPath = process.env.DirectoryPath?.replace(/\\/g, "/");
    if (!directoryPath) {
      throw new Error("Directory path not specified in environment variables.");
    }

    const stats = await fs.stat(directoryPath);
    if (!stats.isDirectory()) {
      throw new Error("Provided directory path is not a directory.");
    }

    const batchSize = parseInt(process.env.BATCH_SIZE, 10) || 1;
    console.log(`Starting processing for directory: ${directoryPath}`);
    await processDirectory(directoryPath, batchSize);
  } catch (error) {
    console.error("Initialization error:", error.message);
    process.exit(1);
  }
})();
