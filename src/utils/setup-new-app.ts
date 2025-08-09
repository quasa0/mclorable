import { randomUUID } from 'crypto';
import { copyFileSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function copyDirectory(src: string, dest: string) {
  // Create destination directory if it doesn't exist
  mkdirSync(dest, { recursive: true });
  
  // Read all items in source directory
  const items = readdirSync(src);
  
  for (const item of items) {
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    const stat = statSync(srcPath);
    
    if (stat.isDirectory()) {
      // Skip .git directory
      if (item === '.git') continue;
      // Recursively copy subdirectory
      copyDirectory(srcPath, destPath);
    } else {
      // Copy file
      copyFileSync(srcPath, destPath);
    }
  }
}

function setupNewApp() {
  // Generate user app ID from first 6 characters of UUID
  const userAppId = randomUUID().substring(0, 6);
  
  // Create destination path
  const destPath = join(process.cwd(), 'user-apps', `user-app-${userAppId}`);
  const templatePath = join(process.cwd(), 'nextjs-app-template');
  
  console.log(`Creating new app with ID: ${userAppId}`);
  
  // Copy all files from template to new user app folder
  copyDirectory(templatePath, destPath);
  
  console.log(`App created successfully at: ${destPath}`);
  return userAppId;
}

// Run the script if executed directly (supports both CJS and ESM)
if (require.main === module || import.meta.url === `file://${process.argv[1]}`) {
  setupNewApp();
}

export { setupNewApp };
