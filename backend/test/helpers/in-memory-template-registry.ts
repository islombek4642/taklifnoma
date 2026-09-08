import type { TemplateDto, TemplateRegistry } from "../../src/application/ports/content-registry.js";

const DEFAULT_TEMPLATES: TemplateDto[] = [
  { id: "classic", name: "Klassik", accentColor: "#b45d52", styleCss: "body { font-family: serif; }" },
];

export class InMemoryTemplateRegistry implements TemplateRegistry {
  constructor(private readonly templates: TemplateDto[] = DEFAULT_TEMPLATES) {}

  async list(): Promise<TemplateDto[]> {
    return this.templates;
  }

  async exists(id: string): Promise<boolean> {
    return this.templates.some((template) => template.id === id);
  }
}
