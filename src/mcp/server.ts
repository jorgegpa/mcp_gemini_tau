import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { execSync } from "child_process";
import * as fs from 'fs';
import * as path from 'path';

const server = new Server({ name: "qa-robot", version: "1.0.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "ejecutar_test",
      description: "Ejecuta un test específico y devuelve el resultado.",
      inputSchema: { 
        type: "object", 
        properties: { path: { type: "string" } },
        required: ["path"]
      },
    },
    {
      name: "leer_archivo_test",
      description: "Lee el contenido de un archivo de test para analizarlo.",
      inputSchema: { 
        type: "object", 
        properties: { path: { type: "string" } },
        required: ["path"]
      },
    },
    {
      name: "corregir_test",
      description: "Sobrescribe un archivo de test con código corregido.",
      inputSchema: { 
        type: "object", 
        properties: { 
          path: { type: "string" },
          nuevoContenido: { type: "string" }
        },
        required: ["path", "nuevoContenido"]
      },
    }
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "ejecutar_test":
      try {
        const out = execSync(`npx vitest run ${args?.path}`).toString();
        return { content: [{ type: "text", text: out }] };
      } catch (error: any) {
        return { content: [{ type: "text", text: error.stdout.toString() }], isError: true };
      }

    case "leer_archivo_test":
      const contenido = fs.readFileSync(path.resolve(args?.path as string), 'utf-8');
      return { content: [{ type: "text", text: contenido }] };

    case "corregir_test":
      fs.writeFileSync(path.resolve(args?.path as string), args?.nuevoContenido as string);
      return { content: [{ type: "text", text: "Archivo actualizado con éxito." }] };

    default:
      throw new Error("Tool no encontrada");
  }
});
// ... (conectar transporte)