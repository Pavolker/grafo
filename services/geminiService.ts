import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { GraphData, DetailLevel, GraphType } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
if (!apiKey) {
  console.warn("VITE_GEMINI_API_KEY environment variable not set. Gemini API calls will fail.");
}
const genAI = new GoogleGenerativeAI(apiKey);

const graphSchema = {
  type: SchemaType.OBJECT,
  properties: {
    nodes: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          id: { type: SchemaType.STRING, description: "Unique identifier for the node (slug format)" },
          label: { type: SchemaType.STRING, description: "Short display name for the node" },
          type: { type: SchemaType.STRING, enum: ['concept', 'person', 'place', 'event', 'other'] },
          description: { type: SchemaType.STRING, description: "Brief description of what this node represents in the context (max 20 words)" },
          importance: { type: SchemaType.NUMBER, description: "Relevance score from 1 to 10" },
          group: { type: SchemaType.STRING, description: "Cluster or category name (for Community graphs)" },
          order: { type: SchemaType.NUMBER, description: "Sequence number (for Timeline/Hierarchy). 1=First/Root." },
        },
        required: ["id", "label", "type", "description", "importance"],
      },
    },
    links: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          source: { type: SchemaType.STRING, description: "ID of the source node" },
          target: { type: SchemaType.STRING, description: "ID of the target node" },
          relation: { type: SchemaType.STRING, description: "Label of the relationship (verb or short phrase)" },
          strength: { type: SchemaType.NUMBER, description: "Strength of connection from 1 to 10" },
        },
        required: ["source", "target", "relation", "strength"],
      },
    },
  },
  required: ["nodes", "links"],
};

export const generateGraphFromText = async (text: string, level: DetailLevel, type: GraphType): Promise<GraphData> => {
  if (!text || text.trim().length === 0) {
    throw new Error("Text input is empty");
  }

  let nodeCountInstruction = "";
  switch (level) {
    case DetailLevel.LOW:
      nodeCountInstruction = "Extract only the top 5-10 most critical entities.";
      break;
    case DetailLevel.MEDIUM:
      nodeCountInstruction = "Extract around 15-25 key entities.";
      break;
    case DetailLevel.HIGH:
      nodeCountInstruction = "Extract 30-50 entities, including subtle details.";
      break;
  }

  let typeInstruction = "";
  switch (type) {
    case GraphType.TREE:
      typeInstruction = "Structure the graph as a Tree. Identify a central root concept and branch out. Use the 'order' field to indicate depth level (1=Root, 2=Branch, etc).";
      break;
    case GraphType.TIMELINE:
      typeInstruction = "Focus on chronological events or logical progression. Use the 'order' field to indicate the sequence (1=First event, 2=Second, etc).";
      break;
    case GraphType.HIERARCHICAL:
      typeInstruction = "Structure the graph hierarchically based on importance or dependency. Use the 'order' field to indicate rank (1=Top, 10=Bottom).";
      break;
    case GraphType.COMMUNITY:
      typeInstruction = "Focus on clustering related entities. Use the 'group' field to assign a community name to each node.";
      break;
    default:
      typeInstruction = "Create a standard knowledge graph connecting related concepts.";
  }

  const prompt = `
    Analyze the following text in Portuguese (or the original language if different) and transform it into a Knowledge Graph structure.
    
    ${nodeCountInstruction}
    
    Graph Type Strategy: ${typeInstruction}
    
    For relationships (links):
    - Identify semantic connections, co-occurrences, or hierarchical dependencies.
    - Ensure 'source' and 'target' match the 'id' of the nodes exactly.
    
    Text to analyze:
    "${text.substring(0, 15000)}" 
  `;

  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: graphSchema,
        temperature: 0.2,
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const jsonText = response.text();
    if (!jsonText) throw new Error("No response from AI");

    const data = JSON.parse(jsonText) as GraphData;
    return data;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    let errorMessage = "Failed to generate graph.";
    if (error.message && error.message.includes("API key")) {
      errorMessage = "Invalid or missing API Key. Please check your configuration.";
    } else if (error.status === 503) {
      errorMessage = "Service temporarily unavailable. Please try again later.";
    }
    throw new Error(errorMessage);
  }
};