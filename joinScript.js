// GitHub API Configuration
const GITHUB_TOKEN_SUFFIX = '1DyloV1tSDJW813AgexIkMVK2YMqqX155bPA'; // Replace with your actual GitHub token
const GITHUB_TOKEN = "ghp_" + GITHUB_TOKEN_SUFFIX
const GITHUB_API_URL = 'https://api.github.com/repos/monkeyluigi/senior_assassin/contents/';

async function joinGame() {
    const gameCode = document.getElementById('game-code').value.trim();
    const gameFilePath = `${gameCode}.json`; // File name format on GitHub

    if (!gameCode) {
        document.getElementById('join-message').textContent = 'Please enter a game code.';
        return;
    }

    try {
        // Fetch the game file from GitHub
        const response = await fetch(GITHUB_API_URL + gameFilePath, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            const content = JSON.parse(atob(data.content));
            document.getElementById('join-message').textContent = `Successfully joined game: ${content.gameCode}`;
        } else if (response.status === 404) {
            document.getElementById('join-message').textContent = 'Game code not found. Please check the code and try again.';
        } else {
            document.getElementById('join-message').textContent = 'An error occurred. Please try again later.';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('join-message').textContent = 'An error occurred while connecting to the server.';
    }
}

// Expose the function globally so the HTML can use it
window.joinGame = joinGame;
