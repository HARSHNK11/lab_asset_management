import { Storage } from "@google-cloud/storage";

const storage = new Storage();

function getObjectConfiguration(environmentVariable) {
  const bucketName = process.env.GCS_BUCKET_NAME?.trim();
  const configuredPath = process.env[environmentVariable]?.trim();

  if (!bucketName) {
    throw new Error("GCS_BUCKET_NAME is not configured");
  }

  if (!configuredPath) {
    throw new Error(`${environmentVariable} is not configured`);
  }

  if (configuredPath.startsWith("gs://")) {
    const objectReference = configuredPath.slice("gs://".length);
    const separatorIndex = objectReference.indexOf("/");
    const configuredBucket = separatorIndex === -1
      ? objectReference
      : objectReference.slice(0, separatorIndex);
    const objectName = separatorIndex === -1
      ? ""
      : objectReference.slice(separatorIndex + 1);

    if (configuredBucket !== bucketName) {
      throw new Error(
        `${environmentVariable} references bucket "${configuredBucket}", but GCS_BUCKET_NAME is "${bucketName}"`
      );
    }

    if (!objectName) {
      throw new Error(`${environmentVariable} does not contain an object path`);
    }

    return { bucketName, objectName };
  }

  const objectName = configuredPath.replace(/^\/+/, "");
  if (!objectName) {
    throw new Error(`${environmentVariable} does not contain an object path`);
  }

  return { bucketName, objectName };
}

export async function getFileFromGCS(environmentVariable) {
  const { bucketName, objectName } = getObjectConfiguration(environmentVariable);

  try {
    const [buffer] = await storage.bucket(bucketName).file(objectName).download();
    return buffer;
  } catch (error) {
    if (error.code === 404) {
      throw new Error(
        `GCS object "${objectName}" was not found in bucket "${bucketName}"`
      );
    }

    if (error.code === 401 || error.code === 403) {
      throw new Error(
        `The configured Google Cloud credentials cannot read GCS object "${objectName}"`
      );
    }

    throw new Error(
      `Unable to retrieve GCS object "${objectName}": ${error.message}`
    );
  }
}

export function getGCSClient() {
  return storage;
}
