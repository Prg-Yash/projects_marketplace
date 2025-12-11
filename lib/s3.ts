import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadToS3(
  file: File,
  folder: string = "projects"
): Promise<string> {
  try {
    console.log("[S3] Starting upload...");
    console.log("[S3] File:", { name: file.name, size: file.size, type: file.type });
    console.log("[S3] Config:", {
      region: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET_NAME,
      hasAccessKey: !!process.env.AWS_ACCESS_KEY_ID,
      hasSecretKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/\s/g, "-")}`;
    const bucketName = process.env.AWS_S3_BUCKET_NAME!;

    console.log("[S3] Uploading:", { fileName, bufferLength: buffer.length });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: buffer,
      ContentType: file.type,
      // ACL removed - use bucket policy instead
    });

    const result = await s3Client.send(command);
    console.log("[S3] Upload response:", result);

    // Return the public URL with correct format
    const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
    console.log("[S3] ✅ SUCCESS! URL:", publicUrl);
    
    return publicUrl;
  } catch (error: any) {
    console.error("[S3] ❌ UPLOAD FAILED!");
    console.error("[S3] Error name:", error.name);
    console.error("[S3] Error message:", error.message);
    console.error("[S3] Error code:", error.Code || error.$metadata?.httpStatusCode);
    console.error("[S3] Full error:", JSON.stringify(error, null, 2));
    throw new Error(`S3 Upload Failed: ${error.message}`);
  }
}

export async function uploadMultipleToS3(
  files: File[],
  folder: string = "projects"
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadToS3(file, folder));
  return Promise.all(uploadPromises);
}
