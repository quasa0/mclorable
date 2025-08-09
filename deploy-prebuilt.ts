import { FreestyleSandboxes } from "freestyle-sandboxes";
import { prepareNextJsForDeployment } from "freestyle-sandboxes/utils";

const api = new FreestyleSandboxes({
  apiKey: "3zSbYPxtD8Gw7u3BhoiwyX-BbhbM8eYpGkYZ7fgoVc7KAJZfbqwgDwaqTqviaBqiHYd",
});

console.log("Deploying...");
const startTime = Date.now();

const nextjsAppRoot = "./user-apps/app-1/";

const files = await prepareNextJsForDeployment(nextjsAppRoot);

api
  .deployWeb(
    files,
    {
      domains: ["yoblosnake213-3.style.dev"],
    }
  )
  .then((result) => {
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    console.log(`Deployed website @ ${result.domains} in ${duration}s`);
  });
