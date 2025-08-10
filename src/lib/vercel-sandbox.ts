import { Sandbox } from "@vercel/sandbox";
import ms from "ms";

interface DevServerResponse {
  codeServerUrl: string;
  ephemeralUrl: string;
}

export class VercelSandboxManager {
  private sandboxes: Map<string, Sandbox> = new Map();

  async requestDevServer(repoId: string): Promise<DevServerResponse> {
    // check if we already have a sandbox for this repo
    let sandbox = this.sandboxes.get(repoId);
    
    if (!sandbox) {
      // create new sandbox
      sandbox = await Sandbox.create({
        source: {
          url: `https://github.com/${repoId}.git`,
          type: "git"
        },
        resources: { vcpus: 4 },
        timeout: ms("30m"),
        ports: [3000, 5173], // common dev server ports
        runtime: "node22"
      });

      // start dev server
      await sandbox.run("npm install && npm run dev");
      
      // store sandbox reference
      this.sandboxes.set(repoId, sandbox);
    }

    // get sandbox url
    const sandboxUrl = sandbox.domain(3000) || sandbox.domain(5173) || "";
    
    return {
      codeServerUrl: sandboxUrl, // for code server functionality 
      ephemeralUrl: sandboxUrl   // for preview
    };
  }

  async destroySandbox(repoId: string): Promise<void> {
    const sandbox = this.sandboxes.get(repoId);
    if (sandbox) {
      await sandbox.destroy();
      this.sandboxes.delete(repoId);
    }
  }
}

export const vercelSandbox = new VercelSandboxManager();