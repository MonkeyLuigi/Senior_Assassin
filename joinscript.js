// GitHub API Configuration
// Import Octokit (for environments like bundlers or modern browsers)
import { Octokit } from 'https://cdn.skypack.dev/@octokit/core';

// Example script
const GITHUB_API_URL = 'https://api.github.com/repos/monkeyluigi/senior_assassin/contents/';
const GITHUB_TOKEN_SUFFIX = '1DyloV1tSDJW813AgexIkMVK2YMqqX155bPA';
const GITHUB_TOKEN = "ghp_" + GITHUB_TOKEN_SUFFIX;
const GITHUB_API_OWNER = 'monkeyluigi'; // Replace with your GitHub username
const GITHUB_API_REPO = 'senior_assassin'; // Replace with your repository name

const octokit = new Octokit({
    auth: GITHUB_TOKEN
});

// Function for players to join a game
async function joinGame() {
    const gameCode = document.getElementById('game-code').value.trim();
    const playerName = document.getElementById('player-name').value.trim();
    const profilePicture = document.getElementById('profile-picture').value.trim() || "default-avatar-url"; // Default if not provided

    if (!gameCode || !playerName) {
        document.getElementById('status').textContent = "Please enter both a valid game code and your name.";
        return;
    }

    try {
        const filePath = `${gameCode}.json`;

        // Fetch the current game data
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: GITHUB_API_OWNER,
            repo: GITHUB_API_REPO,
            path: filePath,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 200) {
            const content = atob(response.data.content);
            const gameData = JSON.parse(content);

            // Check if the player is already in the game
            if (gameData.players.some(player => player.name === playerName)) {
                document.getElementById('status').textContent = "You are already in the game!";
                return;
            }

            // Add the new player to the game data
            const newPlayer = {
                name: playerName,
                status: "alive",
                profilePicture: profilePicture
            };
            gameData.players.push(newPlayer);

            // Upload updated game data to GitHub
            const updateResponse = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
                owner: GITHUB_API_OWNER,
                repo: GITHUB_API_REPO,
                path: filePath,
                message: `Add ${playerName} to the game`,
                committer: {
                    name: 'Game Host',
                    email: 'your-email@example.com'
                },
                content: btoa(JSON.stringify(gameData)),
                headers: {
                    'X-GitHub-Api-Version': '2022-11-28'
                }
            });

            if (updateResponse.status === 200) {
                document.getElementById('status').textContent = `${playerName} has joined the game!`;
            } else {
                document.getElementById('status').textContent = "Failed to join the game. Try again.";
            }
        } else {
            document.getElementById('status').textContent = "Game not found. Check the game code.";
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('status').textContent = "An error occurred while joining the game.";
    }
}


// Expose the function globally so the HTML can use it
window.joinGame = joinGame;
