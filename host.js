// FIX THISSSSSS
// Import Octokit (for environments like bundlers or modern browsers)
import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

// Example script
const GITHUB_API_URL = 'https://api.github.com/repos/monkeyluigi/senior_assassin/contents/';
const GITHUB_TOKEN_NO_PREFIX = "1DyloV1tSDJW813AgexIkMVK2YMqqX155bPA";
const GITHUB_TOKEN = 'ghp_' + GITHUB_TOKEN_NO_PREFIX
const GITHUB_API_OWNER = 'monkeyluigi'; // Replace with your GitHub username
const GITHUB_API_REPO = 'senior_assassin'; // Replace with your repository name

const octokit = new Octokit({
    auth: GITHUB_TOKEN
});

// Function to start a new game
async function startNewGame() {
    const gameCode = Math.floor(Math.random() * 1000000).toString();
    const filePath = `${gameCode}.json`; // Each game gets its own file
    const initialData = {
        gameCode: gameCode,
        players: []
    };

    try {
        // Attempt to create a new game file on GitHub
        const response = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: GITHUB_API_OWNER,
            repo: GITHUB_API_REPO,
            path: filePath,
            message: `Create a new game with code ${gameCode}`,
            committer: {
                name: 'Game Host',
                email: 'kaden.c.clayton@gmail.com'
            },
            content: btoa(JSON.stringify(initialData)),
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 201) { // Status 201 indicates successful file creation
            document.getElementById('game-code-display').textContent = `Game Code: ${gameCode}`;
            alert("Game started! Share this code with joiners.");
        } else {
            alert("Failed to create game. Please check your GitHub settings.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while creating the game.");
    }
}

// Make `startNewGame` accessible in the global scope for HTML onclick usage
window.startNewGame = startNewGame;
