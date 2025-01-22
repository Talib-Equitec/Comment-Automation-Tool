import fs from "fs";
import path from "path";
import OpenAI from "openai";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Access the API key from the environment
const openaiApiKey = process.env.API_KEY;
if (!openaiApiKey) {
  console.error("Error: API_KEY not found in environment variables.");
  process.exit(1);
}

// Initialize OpenAI API
const openai = new OpenAI({ apiKey: openaiApiKey });

// Function to check if a file contains a C# class
function containsCSharpClass(content) {
  return content.includes("class") && content.includes("{");
}

// Function to generate comments using OpenAI
async function generateComments(code) {
  const prompt = `
 You are a code assistant. 
 Please check the provided code files. If a file already contains XML comments for the classes, properties, and fields, do not add or modify any comments and don't return data like markdown way i want raw data as a strings. If a file is missing comments, then please add detailed XML comments explaining the purpose and functionality of each class, property, and field. Ensure that the existing comments remain unchanged. Only add comments to files that do not already have them. Return the updated code with added comments for files that need them.
${code}
  `;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 1500,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("Error with OpenAI request:", error.message);
    return null;
  }
}

// Function to process a single C# file
async function processFile(filePath) {
    try {
      console.log(`Processing file: ${filePath}`);
      const startTime = Date.now();
  
      const code = fs.readFileSync(filePath, "utf-8");
      if (!containsCSharpClass(code)) {
        console.log(`Skipping file: ${filePath} (no class found)`);
        return;
      }
  
      const commentedCode = await generateComments(code);
      if (!commentedCode) return;
  
      // Overwrite the original file with the commented code
      fs.writeFileSync(filePath, commentedCode, "utf-8");
  
      const endTime = Date.now();
      console.log(
        `File processed successfully! Modified file: ${filePath}. Time taken: ${(
          (endTime - startTime) /
          1000
        ).toFixed(2)} seconds.`
      );
    } catch (error) {
      console.error("Error processing file:", filePath, error.message);
    }
  }
  
  // Function to process files in batches
  async function processFilesInBatches(files, batchSize, directoryPath) {
    const batchProcessingStartTime = Date.now();
  
    for (let i = 0; i < files.length; i++) {
      const batchStartTime = Date.now();
  
      // Process one file at a time (by batch)
      const file = files[i];
      const filePath = path.join(directoryPath, file);
  
      if (
        fs.statSync(filePath).isFile() &&
        file.endsWith(".cs") ||
        file.includes("ViewModel") &&
        !file.includes(".designer.cs")
      ) {
        await processFile(filePath);
      }
  
      // Check if the batch is complete or if it's the last file
      if ((i + 1) % batchSize === 0 || i === files.length - 1) {
        const batchEndTime = Date.now();
        console.log(
          `Batch ${Math.ceil((i + 1) / batchSize)} processed. Time taken: ${(
            (batchEndTime - batchStartTime) /
            1000
          ).toFixed(2)} seconds.`
        );
      }
    }
  
    const batchProcessingEndTime = Date.now();
    console.log(
      `All batches processed! Total batch processing time: ${(
        (batchProcessingEndTime - batchProcessingStartTime) /
        1000
      ).toFixed(2)} seconds.`
    );
  }
  
  // Function to batch process all .cs files in a directory
  async function processDirectory(directoryPath, batchSize = 50) {
    try {
      const overallStartTime = Date.now();
  
      const files = fs.readdirSync(directoryPath);
      const csFiles = files.filter(
        (file) => file.endsWith(".cs") && !file.includes(".designer.cs")
      );
  
      console.log(`Found ${csFiles.length} valid .cs files.`);
      await processFilesInBatches(csFiles, batchSize, directoryPath);
  
      const overallEndTime = Date.now();
      console.log(
        `Directory processing complete! Total time taken: ${(
          (overallEndTime - overallStartTime) /
          1000
        ).toFixed(2)} seconds.`
      );
    } catch (error) {
      console.error("Error reading directory:", error.message);
    }
  }
  

// Run the script
let directoryPath = process.env.DirectoryPath; // Replace with your folder path
let Path = directoryPath.replaceAll("\\", "/");
const batchSize = 5; // Set the batch size (adjust as needed)
processDirectory(Path, batchSize);
