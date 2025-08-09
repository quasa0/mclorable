import { FreestyleSandboxes } from "freestyle-sandboxes";

const api = new FreestyleSandboxes({
  apiKey: "3zSbYPxtD8Gw7u3BhoiwyX-BbhbM8eYpGkYZ7fgoVc7KAJZfbqwgDwaqTqviaBqiHYd",
});

console.log("Deploying...");
const startTime = Date.now();

api
  .deployWeb(
    {
      kind: "git",
      url: "https://github.com/freestyle-sh/freestyle-base-nextjs-shadcn", // URL of the repository you want to deploy
    },
    {
      domains: ["yoblosnake213.style.dev"],
      build: true, // automatically detects the framework and builds the code
    }
  )
  .then((result) => {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`Deployed website @ ${result.domains} in ${duration}s`);
  });
