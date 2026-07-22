/**
 * ContentOps Staging Helper Client
 * 
 * 通过单次 SSH 调用 staging-local helper
 * 不使用长期 SSH tunnel
 * 不在 Mac 上存储 Bridge Secret
 */

import { spawn } from 'child_process';

export interface HelperRequest {
  method?: string;
  pathname?: string;
  body: any;
}

export interface HelperResponse {
  status: number;
  body?: any; // Legacy field for backward compatibility
  data?: any; // Actual response data from Bridge API
  error?: any; // Error information if request failed
}

export class StagingHelperClient {
  private sshHost = 'deploy@192.129.155.149';
  private helperPath = '/home/deploy/xixiong-saas-staging/scripts/contentops/bridge-local-helper.ts';
  private connectTimeout = 10000; // 10 seconds
  private commandTimeout = 30000; // 30 seconds

  async request(req: HelperRequest): Promise<HelperResponse> {
    const requestJson = JSON.stringify(req.body);
    
    return new Promise((resolve, reject) => {
      const args = [
        '-o', 'BatchMode=yes',
        '-o', `ConnectTimeout=${this.connectTimeout / 1000}`,
        this.sshHost,
        `cd /home/deploy/xixiong-saas-staging && export $(grep -v '^#' .env.local | xargs) && npx tsx ${this.helperPath}`
      ];

      const child = spawn('ssh', args, {
        stdio: ['pipe', 'pipe', 'pipe']
      });

      let stdout = '';
      let stderr = '';
      let timeoutId: NodeJS.Timeout;

      // Command timeout
      timeoutId = setTimeout(() => {
        child.kill('SIGTERM');
        reject(new Error('CONTENTOPS-SSH-TIMEOUT'));
      }, this.commandTimeout);

      child.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      child.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      // Write request to stdin
      child.stdin.write(requestJson);
      child.stdin.end();

      child.on('close', (code) => {
        clearTimeout(timeoutId);

        if (code === null) {
          reject(new Error('CONTENTOPS-HELPER-EXEC: SSH process killed'));
          return;
        }

        // Parse response - extract only the last valid JSON object from stdout
        try {
          // Try to find the last complete JSON object in stdout
          const jsonMatch = stdout.match(/\{[\s\S]*\}\s*$/);
          if (!jsonMatch) {
            throw new Error('No JSON object found in stdout');
          }
          
          const response: HelperResponse = JSON.parse(jsonMatch[0]);
          resolve(response);
        } catch (error) {
          // Log stderr for debugging but don't include in error message
          if (stderr) {
            console.error('[StagingHelper] stderr:', stderr.substring(0, 500));
          }
          reject(new Error(`CONTENTOPS-HELPER-INVALID-JSON: exit=${code}, stdout_len=${stdout.length}`));
        }
      });

      child.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(new Error(`CONTENTOPS-SSH-CONNECT: ${error.message}`));
      });
    });
  }

  async createTask(taskData: any): Promise<HelperResponse> {
    return this.request({
      method: 'POST',
      pathname: '/api/internal/contentops/drafts',
      body: taskData
    });
  }

  async getTask(taskId: string): Promise<HelperResponse> {
    return this.request({
      method: 'GET',
      pathname: `/api/internal/contentops/drafts?taskId=${taskId}`,
      body: {}
    });
  }

  async listTasks(): Promise<HelperResponse> {
    return this.request({
      method: 'GET',
      pathname: '/api/internal/contentops/drafts',
      body: {}
    });
  }
}

// Singleton instance
export const stagingHelperClient = new StagingHelperClient();
