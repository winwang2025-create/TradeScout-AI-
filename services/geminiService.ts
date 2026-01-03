import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";

const getClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
# Role
You are an expert International Trade Business Development Manager and Senior Data Analyst. You specialize in B2B lead generation, competitor analysis, and supply chain intelligence. Your goal is to help the user evaluate potential clients from a supplier's perspective (specifically focusing on export from China to Global Markets).

# Capabilities
1. Visual Recognition: If the user uploads a business card, accurately OCR the text.
2. Web Search & Synthesis: Use Google Search to find the company's official website, LinkedIn, and details.
3. Business Logic Reasoning: Analyze the company's business model.

# Output Format
Please present the report in the following Structured Markdown format:

## 🎯 客户质量评分 (0-100分)
*评分理由简述*

## 🏢 公司基础画像
| 维度 | 内容 |
| :--- | :--- |
| **公司名称** | [Name] |
| **公司类型** | [e.g., 品牌商 / 批发商 / 承包商] |
| **所在国家/城市** | [Location] |
| **主要产品线** | [Keywords] |
| **网站状态** | [Active/Outdated] |

## 👥 关键联系人挖掘
* **[Name]** - [Title] (LinkedIn/Source Link)
* *邮箱猜测规则*: [e.g., {first}.{last}@domain.com]

## 🕵️‍♂️ 深度采购意向分析
1. **业务模式分析**：...
2. **供应链推测**：...
3. **痛点/切入点**：...

## 10家类似企业
1. [Name]
2. [Name]
...

## 📧 建议开发信切入语 (Cold Email Opener)
*"[Subject Line]"*
"[Draft 2 sentences]"
`;

export const analyzeCompanyText = async (companyNameOrUrl: string): Promise<string> => {
  const ai = getClient();
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Analyze this company: ${companyNameOrUrl}` }]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
        // thinkingConfig: { thinkingBudget: 1024 }, // Optional: enable for deeper reasoning if needed, but search is priority
      }
    });

    return response.text || "No analysis could be generated.";
  } catch (error: any) {
    console.error("Gemini Text Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze company.");
  }
};

export const analyzeBusinessCard = async (file: File): Promise<string> => {
  const ai = getClient();

  try {
    // Convert file to base64
    const base64Data = await fileToGenerativePart(file);

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-latest', // Using 2.5 Flash for robust multimodal + tool support
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: base64Data },
            { text: "Extract the contact information from this business card image. Then, use Google Search to research this company and person. Provide a full B2B analysis report." }
          ]
        }
      ],
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [{ googleSearch: {} }],
      }
    });

    return response.text || "No analysis could be generated from the image.";
  } catch (error: any) {
    console.error("Gemini Image Analysis Error:", error);
    throw new Error(error.message || "Failed to analyze business card.");
  }
};

async function fileToGenerativePart(file: File): Promise<{ mimeType: string; data: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve({
        mimeType: file.type,
        data: base64String,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}