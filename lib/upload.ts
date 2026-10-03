"use server";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file, converts it to WebP, and saves it in the public directory.
 */
export async function uploadAndConvertToWebp(file: File, folder: string): Promise<string | null> {
  try {
    if (!file || file.size === 0) return null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}.webp`;
    const uploadDir = path.join(process.cwd(), "public", "img", folder);

    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    await sharp(buffer)
      .webp({ quality: 80 })
      .toFile(filePath);

    return `/img/${folder}/${fileName}`;
  } catch (error) {
    console.error("Error uploading image:", error);
    return null;
  }
}

/**
 * Uploads a video file (.mp4, .webm, etc.) and saves it in the public directory.
 * No conversion — the file is saved as-is.
 */
export async function uploadVideo(file: File, folder: string = "videos"): Promise<string | null> {
  try {
    if (!file || file.size === 0) return null;

    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const allowedExts = ["mp4", "webm", "mov", "avi"];
    if (!allowedExts.includes(ext)) return null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}.${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "img", folder);

    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    return `/img/${folder}/${fileName}`;
  } catch (error) {
    console.error("Error uploading video:", error);
    return null;
  }
}

/**
 * Server action wrappers for Client Components to upload files via FormData
 * because passing File objects directly from client to server can fail serialization.
 */
export async function uploadImageAction(formData: FormData, folder: string = "modeles"): Promise<string | null> {
  const file = formData.get("file") as File;
  if (!file) return null;
  return await uploadAndConvertToWebp(file, folder);
}

export async function uploadVideoAction(formData: FormData, folder: string = "videos"): Promise<string | null> {
  const file = formData.get("file") as File;
  if (!file) return null;
  return await uploadVideo(file, folder);
}

/**
 * Deletes a file physically from the server.
 */
export async function deletePhysicalImage(url: string): Promise<boolean> {
  try {
    if (!url || !url.startsWith("/img/")) return false;

    const filePath = path.join(process.cwd(), "public", decodeURIComponent(url));
    
    await fs.unlink(filePath);
    return true;
  } catch (error: any) {
    if (error.code !== "ENOENT") {
      console.error("Error deleting image physically:", error);
    }
    return false;
  }
}
