// lib/mcp-client.ts
import { spawn, ChildProcess } from 'child_process';
import path from 'path';

interface MCPToolCall {
  name: string;
  arguments: Record<string, any>;
}

interface MCPResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  isError?: boolean;
}

class MCPClient {
  private process: ChildProcess | null = null;
  private requestId = 1;
  private pendingRequests = new Map<number, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>();
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize() {
    try {
      const serverPath = path.join(process.cwd(), 'mcp-ui-server', 'dist', 'index.js');
      
      this.process = spawn('node', [serverPath], {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      if (this.process.stdout) {
        let buffer = '';
        this.process.stdout.on('data', (data) => {
          buffer += data.toString();
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer
          
          for (const line of lines) {
            if (line.trim()) {
              try {
                const response = JSON.parse(line);
                if (response.id && this.pendingRequests.has(response.id)) {
                  const { resolve, reject } = this.pendingRequests.get(response.id)!;
                  this.pendingRequests.delete(response.id);
                  
                  if (response.error) {
                    reject(new Error(response.error.message || 'MCP Error'));
                  } else {
                    resolve(response.result);
                  }
                }
              } catch (e) {
                // Ignore non-JSON lines (like stderr messages)
                console.debug('MCP non-JSON output:', line);
              }
            }
          }
        });
      }

      if (this.process.stderr) {
        this.process.stderr.on('data', (data) => {
          console.debug('MCP Server stderr:', data.toString());
        });
      }

      this.process.on('exit', (code) => {
        console.error('MCP Server exited with code:', code);
        this.process = null;
        this.isInitialized = false;
      });

      // Initialize the MCP connection
      this.sendRequest('initialize', {
        protocolVersion: '2024-11-05',
        clientInfo: {
          name: 'generative-ui-chatbot',
          version: '1.0.0'
        },
        capabilities: {}
      }).then(() => {
        this.isInitialized = true;
        console.log('MCP Client initialized successfully');
      }).catch((error) => {
        console.error('Failed to initialize MCP connection:', error);
      });

    } catch (error) {
      console.error('Failed to initialize MCP client:', error);
    }
  }

  private sendRequest(method: string, params: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (!this.process || !this.process.stdin) {
        reject(new Error('MCP process not available'));
        return;
      }

      const id = this.requestId++;
      this.pendingRequests.set(id, { resolve, reject });

      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      try {
        this.process.stdin.write(JSON.stringify(request) + '\n');
      } catch (error) {
        this.pendingRequests.delete(id);
        reject(error);
      }

      // Set timeout for request
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error('Request timeout'));
        }
      }, 30000); // 30 second timeout
    });
  }

  async callTool(toolCall: MCPToolCall): Promise<MCPResponse> {
    try {
      // Wait for initialization if not ready
      if (!this.isInitialized) {
        console.log('Waiting for MCP initialization...');
        await new Promise((resolve) => {
          const checkInit = () => {
            if (this.isInitialized) {
              resolve(true);
            } else {
              setTimeout(checkInit, 100);
            }
          };
          checkInit();
        });
      }

      const result = await this.sendRequest('tools/call', {
        name: toolCall.name,
        arguments: toolCall.arguments
      });

      return result;
    } catch (error) {
      console.error('MCP tool call failed:', error);
      return {
        content: [{
          type: 'text',
          text: `Error calling MCP tool: ${error instanceof Error ? error.message : String(error)}`
        }],
        isError: true
      };
    }
  }

  async listTools(): Promise<any> {
    try {
      if (!this.isInitialized) {
        throw new Error('MCP client not initialized');
      }
      return await this.sendRequest('tools/list', {});
    } catch (error) {
      console.error('Failed to list MCP tools:', error);
      return { tools: [] };
    }
  }

  destroy() {
    if (this.process) {
      this.process.kill();
      this.process = null;
    }
    this.pendingRequests.clear();
    this.isInitialized = false;
  }
}

// Singleton instance
let mcpClient: MCPClient | null = null;

export function getMCPClient(): MCPClient {
  if (!mcpClient) {
    mcpClient = new MCPClient();
  }
  return mcpClient;
}

export function destroyMCPClient() {
  if (mcpClient) {
    mcpClient.destroy();
    mcpClient = null;
  }
}

export type { MCPToolCall, MCPResponse };
