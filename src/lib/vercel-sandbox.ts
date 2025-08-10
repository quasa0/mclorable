import { Sandbox } from "@vercel/sandbox";
import ms from "ms";
import path from "path";
import fs from "fs/promises";

interface DevServerResponse {
  codeServerUrl: string;
  ephemeralUrl: string;
  sandbox: Sandbox;
  fs: any; // filesystem interface for ai agent
}

export class VercelSandboxManager {
  private sandboxes: Map<string, Sandbox> = new Map();

  async requestDevServer(appId: string, templatePath?: string): Promise<DevServerResponse> {
    // check if we already have a sandbox for this app
    let sandbox = this.sandboxes.get(appId);
    
    if (!sandbox) {
      // create new sandbox with local files
      sandbox = await Sandbox.create({
        resources: { vcpus: 4 },
        timeout: ms("30m"),
        ports: [3000, 5173], // common dev server ports
        runtime: "node22"
      });

      // if template path provided, copy template files to sandbox
      if (templatePath) {
        // read template files and write to sandbox
        const templateDir = path.join(process.cwd(), "nextjs-app-template");
        const files = await fs.readdir(templateDir, { recursive: true, withFileTypes: true });
        
        for (const file of files) {
          if (file.isFile()) {
            const filePath = path.join(file.path, file.name);
            const relativePath = path.relative(templateDir, filePath);
            const content = await fs.readFile(filePath, "utf-8");
            await sandbox.fs.write(relativePath, content);
          }
        }
      }

      // install dependencies and start dev server
      await sandbox.run("npm install && npm run dev");
      
      // store sandbox reference
      this.sandboxes.set(appId, sandbox);
    }

    // get sandbox url
    const sandboxUrl = sandbox.domain(3000) || sandbox.domain(5173) || "";
    
    return {
      codeServerUrl: sandboxUrl, // for code server functionality 
      ephemeralUrl: sandboxUrl,   // for preview
      sandbox,
      fs: sandbox.fs // expose filesystem for ai agent to modify files
    };
  }

  async destroySandbox(appId: string): Promise<void> {
    const sandbox = this.sandboxes.get(appId);
    if (sandbox) {
      await sandbox.destroy();
      this.sandboxes.delete(appId);
    }
  }
}

export const vercelSandbox = new VercelSandboxManager();