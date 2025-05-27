import fs from 'fs';
import ghpages from 'gh-pages';
import yesno from 'yesno';

async function run() {
  try {
    if (!fs.existsSync('./dist')) {
      console.warn('🚨 dist directory not found.');
      return;
    }

    const ok = await yesno({ question: '🚨 Are you sure you want to deploy? (y/n)' });
    if (!ok) return;

    const stats = fs.statSync('./dist');
    const lastModified = new Date(stats.mtime);
    const now = new Date();

    const diffTime = now.valueOf() - lastModified.valueOf();
    const diffHours = diffTime / 1000 / 60 / 60;

    if (diffHours > 0.5) {
      console.warn('🚨 dist directory is too old.');
      return;
    }
  } catch (err) {
    console.log(err);
    return;
  }

  console.log('🚀 Deploying...');

  ghpages.publish(
    'dist',
    {
      nojekyll: true,
      message: `Update ${new Date().toISOString()}`,
    },
    err => {
      if (err) {
        console.error(err);
        return;
      }

      console.log('🚀 Deployed!');
    }
  );
}

run();
