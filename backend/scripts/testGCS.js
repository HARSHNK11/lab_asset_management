import dotenv from "dotenv";
import ExcelJS from "exceljs";
import mammoth from "mammoth";
import { getFileFromGCS } from "../services/cloudStorage.js";

dotenv.config();

async function testFile(environmentVariable, parser) {
  const buffer = await getFileFromGCS(environmentVariable);
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    throw new Error(`${environmentVariable} returned an empty file`);
  }

  await parser(buffer);
  console.log(`${environmentVariable}: retrieved and parsed successfully`);
}

async function run() {
  await testFile("GCS_CSE_FILE", async buffer => {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);
  });

  await testFile("GCS_DSE_FILE", async buffer => {
    await mammoth.extractRawText({ buffer });
  });

  await testFile("GCS_ICT_FILE", async buffer => {
    await mammoth.extractRawText({ buffer });
  });

  console.log("GCS connectivity test completed without modifying MongoDB");
}

run().catch(error => {
  console.error(`GCS test failed: ${error.message}`);
  process.exitCode = 1;
});
