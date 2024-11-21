// Example script
const GITHUB_API_URL = 'https://api.github.com/repos/monkeyluigi/senior_assassin/contents/';
const GITHUB_TOKEN_NO_PREFIX = process.env.GITHUB_TOKEN || '';
const GITHUB_TOKEN = 'ghp_' + GITHUB_TOKEN_NO_PREFIX

// Test that the token is being accessed
if (!GITHUB_TOKEN) {
    console.error('GitHub Token not found. Make sure you set the environment variable!');
    process.exit(1);
}

console.log('GitHub Token loaded successfully!');

// Proceed with your API call
async function startNewGame() {
    const gameCode = Math.floor(Math.random() * 1000000).toString();
    const filePath = `${gameCode}.json`;
    const initialData = {
        gameCode: gameCode,
        players: []
    };

    try {
        const response = await fetch(GITHUB_API_URL + filePath, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Create new game',
                content: btoa(JSON.stringify(initialData))
            })
        });

        if (response.ok) {
            alert(`Game started! Game Code: ${gameCode}`);
        } else {
            const error = await response.json();
            console.error('GitHub API Error:', error);
            alert('Failed to create the game. Check console for details.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while creating the game.');
    }
}
