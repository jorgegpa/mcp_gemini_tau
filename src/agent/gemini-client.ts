import { GoogleGenerativeAI } from "@google/generative-ai";
import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// 1. Configuración del Cliente
const API_KEY = process.env.GEMINI_API_KEY || "TU_API_KEY_AQUI";
const genAI = new GoogleGenerativeAI(API_KEY);

const tools = [
    {
        functionDeclarations: [
            {
                name: "ejecutar_test",
                description: "Ejecuta un test de Vitest y genera reporte Allure.",
                parameters: {
                    type: "OBJECT",
                    properties: { path: { type: "string", description: "Ruta del archivo .test.ts" } },
                    required: ["path"],
                },
            },
            {
                name: "leer_archivo_test",
                description: "Lee el código fuente de un archivo de test.",
                parameters: {
                    type: "OBJECT",
                    properties: { path: { type: "string" } },
                    required: ["path"],
                },
            },
            {
                name: "escribir_o_corregir_test",
                description: "Crea o modifica un archivo de test con nuevo código.",
                parameters: {
                    type: "OBJECT",
                    properties: {
                        path: { type: "string" },
                        nuevoContenido: { type: "string" }
                    },
                    required: ["path", "nuevoContenido"],
                },
            },
        ],
    },
];

const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash", // Corregido a versión existente
    tools: tools,
});

// 2. Lógica de Ejecución del Agente
async function agenteQA(pregunta: string) {
    console.log(`\n🚀 Usuario: ${pregunta}`);
    const chat = model.startChat();
    let result = await chat.sendMessage(pregunta);
    let responsePart = result.response.candidates?.[0].content.parts[0];

    while (responsePart?.functionCall) {
        const { name, args } = responsePart.functionCall;
        console.log(`\n🛠️ IA solicita usar herramienta: ${name}...`);

        let toolResult: string;
        try {
            if (name === "ejecutar_test") {
                const testPath = args.path as string; // Definido correctamente
                console.log(`🏃 Ejecutando: npx vitest run ${testPath}`);
                try {
                    toolResult = execSync(
                        `npx vitest run ${testPath} --reporter=default --reporter=allure-vitest/reporter`,
                        {
                            cwd: process.cwd(),
                            env: { ...process.env, ALLURE_RESULTS_DIR: "allure-results" },
                            stdio: 'pipe'
                        }
                    ).toString();
                    console.log("✅ Test completado.");
                } catch (error: any) {
                    toolResult = error.stdout?.toString() || error.message;
                    console.log("⚠️ El test falló, enviando logs a la IA...");
                }
                // Pausa para asegurar escritura de Allure
                await new Promise(resolve => setTimeout(resolve, 1000));

            } else if (name === "leer_archivo_test") {
                toolResult = fs.readFileSync(path.resolve(args.path as string), "utf-8");
            } else if (name === "escribir_o_corregir_test") {
                const targetPath = path.resolve(args.path as string);
                const dir = path.dirname(targetPath);
                if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
                
                fs.writeFileSync(targetPath, args.nuevoContenido as string);
                toolResult = "Archivo actualizado correctamente.";
            } else {
                toolResult = "Error: Herramienta no reconocida.";
            }

            // Enviar respuesta de la herramienta a Gemini
            result = await chat.sendMessage([
                {
                    functionResponse: {
                        name: name,
                        response: { content: toolResult },
                    },
                },
            ]);
            responsePart = result.response.candidates?.[0].content.parts[0];

        } catch (error: any) {
            console.error("❌ Error en ejecución de herramienta:", error.message);
            break;
        }
    }

    console.log(`\n🤖 Gemini concluye: ${result.response.text()}`);
}

// 3. Función Principal
async function main() {
    console.log("--- INICIANDO DEMO DE AGENTE QA ---");
    try {
        // Escenario 1
        await agenteQA("Revisa src/tests/login.test.ts, si ves que el selector es incorrecto, cámbialo a '[data-test=\"username\"]' y ejecútalo.");
        // Escenario 2
        await agenteQA("Lista los archivos en src/tests/ y dime cuál debería ejecutar para SauceDemo.");
        // Escenario 3
        await agenteQA("Crea un test en src/tests/error.test.ts para login fallido con 'user_invalid' en SauceDemo.");

    } catch (err) {
        console.error("Error en el main:", err);
    }
    console.log("\n✅ Proceso terminado. Usa 'npm run allure:generate && npm run allure:open'");
}

main();