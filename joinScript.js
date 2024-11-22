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

// Function to render the list of players
function renderPlayerList() {
    try {
        // Fetch the game file from GitHub
        const response = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: "monkeyluigi",
            repo: 'senior_assassin',
            path: gamefilePath,
            headers: {
                'X-GitHub-Api-Version': '2022-11-28'
            }
        });

        if (response.status === 200) {
            const content = atob(response.data.content);
            const gameData = JSON.parse(content);

            // Update the UI with the retrieved game data
            players = gameData.players || [];
            renderPlayerList();  // Call the function to render the player list

            document.getElementById('game-code-display').textContent = `Game Code: ${gameData.gameCode}`;
            document.getElementById('resume-status').textContent = "Game resumed successfully!";
            document.getElementById('resume-status').style.color = "green";
        } else {
            document.getElementById('resume-status').textContent = "Failed to fetch game data. Game code may be incorrect.";
        }
    } catch (error) {
        console.error('Error fetching game data:', error);
        document.getElementById('resume-status').textContent = "An error occurred. Make sure the game code is correct.";
    }
    const playerListContainer = document.getElementById('player-list');

    // Check if the player-list element exists before proceeding
    if (playerListContainer) {
        playerListContainer.innerHTML = ''; // Clear existing list

        if (players.length > 0) {
            players.forEach(player => {
                const playerItem = document.createElement('li');
                playerItem.textContent = player;  // Assuming player is just a name or username
                playerListContainer.appendChild(playerItem);
            });
        } else {
            playerListContainer.textContent = "No players yet.";
        }
    } else {
        console.error('Error: player-list element not found.');
    }
}

// Expose the function globally so the HTML can use it
window.joinGame = joinGame;
