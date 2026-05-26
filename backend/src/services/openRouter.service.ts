import axios from 'axios';
import { AnalysisResult, OpenRouterResponse } from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY || '';
const MODEL = process.env.OPENROUTER_MODEL || 'openrouter/auto';
const WEB_URL = process.env.WEB_URL || 'http://localhost:5173';

const SYSTEM_PROMPT = `Eres un analizador experto de prompts para IA generativa. Tu tarea es analizar prompts y extraer metadata estructurada en formato JSON.

REGLAS IMPORTANTES:
1. Responde ÚNICAMENTE con JSON válido, sin markdown, sin explicaciones
2. El JSON debe estar completo y bien formateado
3. Usa valores null si no puedes determinar algo
4. Los tags deben ser relevantes y específicos (en inglés, lowercase, separados por guiones)
5. La confianza debe reflejar tu certeza (0.0 - 1.0)

CATEGORÍAS VÁLIDAS:
- IMAGEN: prompts para generación de imágenes (DALL-E, Midjourney, Stable Diffusion, etc.)
- VIDEO: prompts para generación de video (Runway, Pika, etc.)
- TEXTO: prompts para LLMs (ChatGPT, Claude, etc.)
- AUDIO: prompts para generación de audio/música/voz

ESTRUCTURA DE RESPUESTA:
{
  "title": "string - título conciso y descriptivo (max 100 chars)",
  "description": "string - descripción breve de qué hace el prompt (max 300 chars)",
  "category": "IMAGEN|VIDEO|TEXTO|AUDIO",
  "subcategory": "string - subcategoría específica según la categoría",
  "tags": ["array", "de", "tags", "relevantes", "en", "ingles", "lowercase"],
  "metadata": {
    // campos específicos según categoría
  },
  "confidence": 0.0-1.0
}

PARA CATEGORÍA IMAGEN, incluir en metadata:
- style: fotorealista|anime|ilustración|3d|pintura|pixel-art|concept-art
- pose: retrato|panorámica|primer-plano|medio-cuerpo|cuerpo-completo
- camera: 35mm|50mm|85mm|gran-angular|telefoto|macro
- lighting: natural|estudio|contraluz|hora-dorada|nocturna
- aspect_ratio: 1:1|16:9|9:16|4:3|3:2
- color_palette: vibrante|monocromático|sepia|pastel|neon
- mood: alegre|melancólico|dramático|pacífico|misterioso

PARA CATEGORÍA VIDEO, incluir en metadata:
- duration: corto|medio|largo
- movement: estático|pan|zoom|tracking|drone
- transitions: suave|abrupta|fade|cut
- pace: lento|moderado|rápido
- style: cinematográfico|documental|experimental

PARA CATEGORÍA TEXTO, incluir en metadata:
- type: copywriting|código|análisis|creativo|resumen|traducción
- tone: profesional|casual|humorístico|académico|persuasivo
- length: corto|medio|largo
- target_audience: general|técnico|ejecutivo|niños

PARA CATEGORÍA AUDIO, incluir en metadata:
- type: voz|música|efectos
- style: narrativo|conversacional|musical|ambiental
- genre: rock|electrónica|clásica|jazz|pop|hip-hop
- mood: energético|relajado|triste|alegre
- tempo: lento|moderado|rápido`;

export async function analyzePrompt(promptContent: string): Promise<AnalysisResult> {
  if (!API_KEY) {
    throw new Error('OPENROUTER_API_KEY no está configurada');
  }

  const response = await axios.post<OpenRouterResponse>(
    OPENROUTER_API_URL,
    {
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analiza el siguiente prompt y extrae la metadata estructurada:\n\n---\n${promptContent}\n---` }
      ],
      temperature: 0.3,
      max_tokens: 1000
    },
    {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': WEB_URL,
        'X-Title': 'PromptVault'
      },
      timeout: 30000
    }
  );

  const content = response.data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Respuesta vacía de OpenRouter');
  }

  // Extraer JSON de la respuesta
  let jsonContent = content;
  
  // Si hay markdown code block, extraer solo el JSON
  const codeBlockMatch = content.match(/```json\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonContent = codeBlockMatch[1].trim();
  }

  try {
    const result: AnalysisResult = JSON.parse(jsonContent);
    return result;
  } catch (error) {
    console.error('Error parseando JSON:', content);
    throw new Error('Respuesta inválida de OpenRouter: no es JSON válido');
  }
}

export async function analyzePromptWithRetry(
  promptContent: string,
  maxRetries = 3
): Promise<AnalysisResult> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await analyzePrompt(promptContent);
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      
      // Backoff exponencial: 1s, 2s, 4s
      const delay = Math.pow(2, attempt - 1) * 1000;
      console.log(`Reintentando análisis en ${delay}ms... (intento ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw new Error('Máximo de reintentos excedido');
}
