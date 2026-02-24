#!/usr/bin/env node
import fs from "fs/promises";
import path from "path";

/**
 * Deletes all folders inside baseDir that start with a dot.
 * Retries if folder is busy (EBUSY / EPERM) every 500ms.
 */
async function deleteDottedFolders(baseDir) {
    const fullBase = path.resolve(baseDir);
    console.log(`Scanning: ${fullBase}`);

    let entries;
    try {
        entries = await fs.readdir(fullBase, { withFileTypes: true });
    } catch (err) {
        if (err.code === "ENOENT") return console.log("Base folder does not exist");
        return console.error("Failed to list folder:", err);
    }

    for (const e of entries) {
        if (!e.isDirectory()) continue;
        if (!e.name.startsWith(".")) continue;

        const folderPath = path.join(fullBase, e.name);
        await deleteFolder(folderPath);
    }
}

/**
 * Deletes a folder, retries if busy
 */
async function deleteFolder(folderPath) {
    try {
        console.log(`Deleting folder: ${folderPath}`);
        await fs.rm(folderPath, { recursive: true, force: true });
        console.log("✅ Deleted successfully");
    } catch (err) {
        if (err.code === "EBUSY" || err.code === "EPERM") {
            console.warn(`⚠️ Folder busy, retrying in 500ms: ${folderPath}`);
            setTimeout(() => deleteFolder(folderPath), 500);
        } else if (err.code === "ENOENT") {
            console.log("Folder already deleted:", folderPath);
        } else {
            console.error("❌ Failed to delete folder:", folderPath, err);
        }
    }
}

// Pass base folder as first argument
const baseFolder = process.argv[2];
if (!baseFolder) {
    console.error("Usage: node delete-dotted-folders.js <base-folder>");
    process.exit(1);
}

// Run
deleteDottedFolders(baseFolder);
