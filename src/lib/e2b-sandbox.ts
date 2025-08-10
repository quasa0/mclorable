import { Sandbox } from "e2b";
import path from "path";
import fs from "fs/promises";

interface DevServerResponse {
  codeServerUrl: string;
  ephemeralUrl: string;
  sandbox: Sandbox;
  fs: any; // filesystem interface for ai agent
}

export class E2BSandboxManager {
  private sandboxes: Map<string, Sandbox> = new Map();

  async requestDevServer(appId: string, templatePath?: string): Promise<DevServerResponse> {
    // check if we already have a sandbox for this app
    let sandbox = this.sandboxes.get(appId);
    
    if (!sandbox) {
      // create new sandbox
      sandbox = await Sandbox.create({
        template: "base", // use base template
        timeout: 1800, // 30 minutes
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
            await sandbox.files.write(relativePath, content);
          }
        }
      }

      // install dependencies and start dev server
      const proc = await sandbox.commands.run("npm install && npm run dev", {
        background: true,
        onStdout: (chunk) => console.log("sandbox:", chunk),
        onStderr: (chunk) => console.error("sandbox error:", chunk),
      });
      
      // wait a bit for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // store sandbox reference
      this.sandboxes.set(appId, sandbox);
    }

    // get sandbox url - e2b provides getHost() method
    const sandboxUrl = `https://${sandbox.getHost(3000)}`;
    
    return {
      codeServerUrl: sandboxUrl, // for code server functionality 
      ephemeralUrl: sandboxUrl,   // for preview
      sandbox,
      fs: sandbox.files // expose filesystem for ai agent to modify files
    };
  }

  async destroySandbox(appId: string): Promise<void> {
    const sandbox = this.sandboxes.get(appId);
    if (sandbox) {
      await sandbox.kill();
      this.sandboxes.delete(appId);
    }
  }
}

export const e2bSandbox = new E2BSandboxManager();