import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { TemplateDto, TemplateRegistry } from "../../application/ports/content-registry.js";

interface TemplateManifest {
  name: string;
  description: string;
  accentColor: string;
}

/**
 * Reads templates from CONTENT_DIR/templates/<id>/{manifest.json,style.css}.
 * A new template becomes available just by adding a folder there — no
 * code change or redeploy needed (this is what an admin upload flow will
 * write into, once it exists).
 */
export class FilesystemTemplateRegistry implements TemplateRegistry {
  constructor(private readonly contentDir: string) {}

  async list(): Promise<TemplateDto[]> {
    const ids = await this.listTemplateIds();
    const templates = await Promise.all(ids.map((id) => this.read(id)));
    return templates.filter((template): template is TemplateDto => template !== null);
  }

  async exists(id: string): Promise<boolean> {
    return (await this.read(id)) !== null;
  }

  private get templatesDir(): string {
    return path.join(this.contentDir, "templates");
  }

  private async listTemplateIds(): Promise<string[]> {
    const entries = await readdir(this.templatesDir, { withFileTypes: true }).catch(() => []);
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  }

  private async read(id: string): Promise<TemplateDto | null> {
    try {
      const dir = path.join(this.templatesDir, id);
      const manifestRaw = await readFile(path.join(dir, "manifest.json"), "utf-8");
      const manifest = JSON.parse(manifestRaw) as TemplateManifest;
      const styleCss = await readFile(path.join(dir, "style.css"), "utf-8");
      return { id, name: manifest.name, description: manifest.description, accentColor: manifest.accentColor, styleCss };
    } catch {
      return null;
    }
  }
}
