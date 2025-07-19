import axios from 'axios';

export interface Tool {
  name: string;
  description: string;
  parameters: any;
}

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface ImageGenRequest {
  model: string;
  prompt: string;
  n?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  response_format?: 'url' | 'b64_json';
  quality?: 'standard' | 'hd';
  style?: 'vivid' | 'natural';
  user?: string;
}

interface ImageData {
  url?: string;
  b64_json?: string;
  revised_prompt?: string;
}

interface ImageGenResponse {
  created: number;
  data: ImageData[];
}

class ToolService {
  private serperApiKey: string;
  private a4fApiKey: string;

  constructor() {
    this.serperApiKey = import.meta.env.VITE_SERPER_API_KEY || '';
    this.a4fApiKey = import.meta.env.VITE_A4F_API_KEY || '';
  }

  async webSearch(query: string): Promise<ToolResult> {
    try {
      const response = await axios.post('https://google.serper.dev/search', {
        q: query,
        num: 10
      }, {
        headers: {
          'X-API-KEY': this.serperApiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          query,
          results: response.data.organic || [],
          answerBox: response.data.answerBox,
          knowledgeGraph: response.data.knowledgeGraph,
          searchParameters: response.data.searchParameters
        }
      };
    } catch (error) {
      console.error('Web search error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web search failed'
      };
    }
  }

  async webScrape(url: string): Promise<ToolResult> {
    try {
      const response = await axios.post('https://scrape.serper.dev', {
        url: url
      }, {
        headers: {
          'X-API-KEY': this.serperApiKey,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        data: {
          url,
          title: response.data.title,
          content: response.data.text,
          links: response.data.links,
          images: response.data.images
        }
      };
    } catch (error) {
      console.error('Web scrape error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Web scraping failed'
      };
    }
  }

  async generateImage(prompt: string, options: Partial<ImageGenRequest> = {}): Promise<ToolResult> {
    try {
      if (!this.a4fApiKey) {
        return {
          success: false,
          error: 'A4F API key not configured. Please add VITE_A4F_API_KEY to your environment variables.'
        };
      }

      const payload: ImageGenRequest = {
        model: 'provider-3/gpt-image-1',
        prompt,
        n: options.n || 1,
        size: options.size || '1024x1024',
        response_format: options.response_format || 'url',
        quality: options.quality || 'hd',
        style: options.style || 'vivid',
        ...options
      };

      const response = await axios.post<ImageGenResponse>(
        'https://api.a4f.co/v1/images/generations',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.a4fApiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 60000 // 60 second timeout for image generation
        }
      );

      const { created, data } = response.data;

      return {
        success: true,
        data: {
          created,
          images: data.map((img, idx) => ({
            id: idx + 1,
            url: img.url,
            b64_json: img.b64_json,
            revised_prompt: img.revised_prompt,
            original_prompt: prompt
          }))
        }
      };
    } catch (error) {
      console.error('Image generation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Image generation failed'
      };
    }
  }

  getAvailableTools(): Tool[] {
    return [
      {
        name: 'web_search',
        description: 'Search the web for current information and answers',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query'
            }
          },
          required: ['query']
        }
      },
      {
        name: 'web_scrape',
        description: 'Scrape content from a specific website URL',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to scrape'
            }
          },
          required: ['url']
        }
      },
      {
        name: 'generate_image',
        description: 'Generate high-quality images from text descriptions',
        parameters: {
          type: 'object',
          properties: {
            prompt: {
              type: 'string',
              description: 'Detailed description of the image to generate'
            },
            size: {
              type: 'string',
              enum: ['256x256', '512x512', '1024x1024', '1792x1024', '1024x1792'],
              description: 'Size of the generated image'
            },
            style: {
              type: 'string',
              enum: ['vivid', 'natural'],
              description: 'Style of the generated image'
            },
            quality: {
              type: 'string',
              enum: ['standard', 'hd'],
              description: 'Quality of the generated image'
            }
          },
          required: ['prompt']
        }
      }
    ];
  }

  async executeTool(toolName: string, parameters: any): Promise<ToolResult> {
    switch (toolName) {
      case 'web_search':
        return await this.webSearch(parameters.query);
      case 'web_scrape':
        return await this.webScrape(parameters.url);
      case 'generate_image':
        return await this.generateImage(parameters.prompt, parameters);
      default:
        return {
          success: false,
          error: `Unknown tool: ${toolName}`
        };
    }
  }
}

export const toolService = new ToolService();