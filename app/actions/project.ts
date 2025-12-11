"use server";

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { uploadToS3, uploadMultipleToS3 } from "@/lib/s3";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProject(formData: FormData) {
  const session = await auth();

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Extract form data
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseInt(formData.get("price") as string);
  const category = formData.get("category") as string;
  const techStack = (formData.get("techStack") as string).split(",").map((t) => t.trim());
  const videoUrl = formData.get("videoUrl") as string || null;
  const projectUrl = formData.get("projectUrl") as string || null;

  // Handle file uploads
  const thumbnail = formData.get("thumbnail") as File | null;
  const zipFile = formData.get("zipFile") as File | null;
  
  console.log("📋 FORM DATA RECEIVED:");
  console.log("Thumbnail:", thumbnail ? `${thumbnail.name} (${thumbnail.size} bytes)` : "none");
  console.log("ZIP:", zipFile ? `${zipFile.name} (${zipFile.size} bytes)` : "none");
  
  // Handle multiple images - ONLY add files that actually have content
  const images: File[] = [];
  for (let i = 0; i < 5; i++) {
    const image = formData.get(`image${i}`) as File | null;
    // Check if file exists AND has a real filename (not empty) AND has size > 0
    if (image && image.name && image.name !== "" && image.size > 0) {
      console.log(`✅ Image${i}:`, `${image.name} (${image.size} bytes, type: ${image.type})`);
      images.push(image);
    } else {
      console.log(`❌ Image${i}:`, "skipped (empty or no file)");
    }
  }

  try {
    console.log("\n🚀 Starting project creation...", { title, category, imagesCount: images.length });

    // Upload thumbnail to S3
    let thumbnailUrl: string | null = null;
    if (thumbnail && thumbnail.name && thumbnail.size > 0) {
      console.log("📸 Uploading thumbnail...", { name: thumbnail.name, size: thumbnail.size });
      thumbnailUrl = await uploadToS3(thumbnail, "thumbnails");
      console.log("✅ Thumbnail uploaded:", thumbnailUrl);
    } else {
      console.log("⏭️  Skipping thumbnail (no file selected)");
    }

    // Upload images to S3
    let imageUrls: string[] = [];
    if (images.length > 0) {
      console.log(`Uploading ${images.length} screenshots...`);
      imageUrls = await uploadMultipleToS3(images, "screenshots");
      console.log("Screenshots uploaded:", imageUrls);
    }

    // Upload ZIP file to S3
    let zipFileName: string | null = null;
    let zipFileSize: number | null = null;
    let zipFileUrl: string | null = null;
    if (zipFile && zipFile.size > 0) {
      zipFileName = zipFile.name;
      zipFileSize = zipFile.size;
      console.log("📦 Uploading ZIP file...", { zipFileName, zipFileSize });
      zipFileUrl = await uploadToS3(zipFile, "project-files");
      console.log("✅ ZIP file uploaded:", zipFileUrl);
    }

    console.log("Creating project in database...");
    console.log("📊 Data to save:", {
      title,
      thumbnailUrl,
      zipFileUrl,
      imageUrls,
      imageCount: imageUrls.length,
    });
    
    // Create project in database
    const project = await prisma.project.create({
      data: {
        title,
        description,
        price,
        category,
        techStack,
        videoUrl,
        projectUrl,
        thumbnailUrl,
        zipFileName,
        zipFileSize,
        zipFileUrl,
        sellerId: session.user.id,
        images: {
          create: imageUrls.map((url) => ({ url })),
        },
      },
      include: {
        images: true, // Include images in the response to verify
      },
    });

    console.log("✅ Project created successfully:", project.id);
    console.log("📸 Images saved:", project.images);

    revalidatePath("/dashboard");
    revalidatePath("/projects");
    
    return { success: true, projectId: project.id };
  } catch (error) {
    console.error("Error creating project:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create project";
    throw new Error(errorMessage);
  }
}
