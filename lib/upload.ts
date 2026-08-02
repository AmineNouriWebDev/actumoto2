"use server";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";

/**
 * Uploads a file, converts it to WebP, and saves it in the public directory.
 * @param file The file from FormData
 * @param folder The target folder inside `public/img/` (e.g., "marques", "modeles")
 * @returns The public URL of the saved image (e.g., "/img/marques/123-abc.webp")
 */
export async function uploadAndConvertToWebp(file: File, folder: string): Promise<string | null> {
  try {
    if (!file || file.size === 0) return null;

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = `${uuidv4()}.webp`;
    const uploadDir = path.join(process.cwd(), "public", "img", folder);

    // Ensure directory exists
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, fileName);

    // Convert to webp and save
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
 * Deletes a file physically from the server.
 * @param url The public URL of the image (e.g., "/img/marques/123-abc.webp")
 */
export async function deletePhysicalImage(url: string): Promise<boolean> {
  try {
    if (!url || !url.startsWith("/img/")) return false;

    // Decode URL just in case, though we generated it
    const filePath = path.join(process.cwd(), "public", decodeURIComponent(url));
    
    await fs.unlink(filePath);
    return true;
  } catch (error: any) {
    // Ignore error if file doesn't exist
    if (error.code !== "ENOENT") {
      console.error("Error deleting image physically:", error);
    }
    return false;
  }
}
