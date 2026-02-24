import { app } from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const projectDir = path.dirname(__dirname);

if (!fs.existsSync(path.join(projectDir, "project.json"))) throw new Error("Missing project.json");
export const projectConfig = JSON.parse(fs.readFileSync(path.join(projectDir, "project.json"), "utf8"));

export const projectName = projectConfig.name ?? "project";

export const BASE_DIR = path.join(app.getPath("documents"), projectName);
export const projectsPath = path.join(BASE_DIR, "projects");

if (!fs.existsSync(projectsPath)) fs.mkdirSync(projectsPath, { recursive: true });