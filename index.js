const core = require('@actions/core');
const { exec } = require('@actions/exec');
const fs = require('fs');
const path = require('path');

async function run() {
  try {
    const csvPath = core.getInput('csvPath');
    const csvContent = fs.readFileSync(csvPath, 'utf8');

    // Split CSV content into rows
    const rows = csvContent.split('\n').map(row => row.split(','));

    // Process each row
    for (const row of rows) {
      if (row.length < 2) continue; // Skip rows without enough data

      const repository = row[0].trim();
      const ref = row[1].trim();
      const path = process.env.GITHUB_WORKSPACE;

      // Initialize a new Git repository
      await exec(`git init`, { cwd: path });

      // Add the remote repository
      await exec(`git remote add origin https://github.com/${repository}.git`, { cwd: path });

      // Fetch the repository
      await exec(`git fetch --depth=1 origin ${ref}`, { cwd: path });

      // Reset to the fetched commit
      await exec(`git reset --hard FETCH_HEAD`, { cwd: path });

      // Set safe directory if needed
      await exec(`git config --global --add safe.directory ${path}`, { cwd: path });
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
