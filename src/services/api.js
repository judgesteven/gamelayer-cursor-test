const API_BASE_URL = 'https://api.gamelayer.co/api/v0';
const ACCOUNT_ID = 'new-account-content';
const API_KEY = '4cb261227289f22693e1c8e634fa99cf';

const baseHeaders = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'api-key': API_KEY
};

// Authentication function
export const authenticate = async () => {
  try {
    const url = `${API_BASE_URL}/auth`;
    const response = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({
        account: ACCOUNT_ID,
        api_key: API_KEY
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Authentication Error:', errorText);
      throw new Error('Authentication failed');
    }

    return await response.json();
  } catch (error) {
    console.error('Authentication error:', error);
    throw error;
  }
};

export const fetchMissions = async (playerId) => {
  try {
    const url = `${API_BASE_URL}/missions?account=${ACCOUNT_ID}${playerId ? `&player=${playerId}` : ''}`;
    const response = await fetch(url, {
      headers: baseHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Missions Error:', errorText);
      throw new Error('Failed to fetch missions');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching missions:', error);
    throw error;
  }
};

export const fetchPrizes = async (playerId) => {
  try {
    const url = `${API_BASE_URL}/prizes?account=${ACCOUNT_ID}${playerId ? `&player=${playerId}` : ''}`;
    const response = await fetch(url, {
      headers: baseHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prizes Error:', errorText);
      throw new Error('Failed to fetch prizes');
    }

    const data = await response.json();
    console.log('Prizes API Response:', JSON.stringify(data, null, 2));
    return data;
  } catch (error) {
    console.error('Error fetching prizes:', error);
    throw error;
  }
};

export const fetchPlayers = async () => {
  try {
    // First try to get all players
    const url = `${API_BASE_URL}/players?account=${ACCOUNT_ID}`;
    const response = await fetch(url, {
      headers: baseHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Players Error:', errorText);
      throw new Error('Failed to fetch players');
    }

    const data = await response.json();
    console.log('Players API Response:', JSON.stringify(data, null, 2));
    
    // If data is an array, return it directly, otherwise check for a players property
    if (Array.isArray(data)) {
      return data;
    } else if (data && data.players) {
      return data.players;
    } else if (data && data.data) {
      return data.data;
    } else {
      console.warn('Unexpected players data format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching players:', error);
    throw error;
  }
};

export const getPlayer = async (uid) => {
  try {
    // Try to get the specific player directly
    const url = `${API_BASE_URL}/players/${uid}?account=${ACCOUNT_ID}`;
    const response = await fetch(url, {
      headers: baseHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Get Player Error:', errorText);
      throw new Error('Player not found');
    }

    const player = await response.json();
    return player;
  } catch (error) {
    console.error('Error getting player:', error);
    throw error;
  }
};

export const fetchTeam = async (teamId) => {
  try {
    const url = `${API_BASE_URL}/teams/${teamId}?account=${ACCOUNT_ID}`;
    const response = await fetch(url, {
      headers: baseHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Team Error:', errorText);
      throw new Error('Failed to fetch team');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};

export const createPlayer = async (playerData) => {
  try {
    // First, try to get the existing player directly
    try {
      const player = await getPlayer(playerData.uid);
      console.log('Player already exists, returning existing player data');
      return player;
    } catch (error) {
      // Player not found, continue with creation
      console.log('Player not found, creating new player');
    }

    const url = `${API_BASE_URL}/players`;
    const response = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({
        account: ACCOUNT_ID,
        player: playerData.uid,
        name: playerData.name,
        email: playerData.email,
        uid: playerData.uid,
        points: playerData.points || 0,
        credits: playerData.credits || 0,
        level: playerData.level || {
          current: 1,
          experience: 0
        },
        imgUrl: playerData.imgUrl
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create Player Error:', errorText);
      
      // If we get a 409 conflict, try to get the player directly
      if (response.status === 409) {
        try {
          const player = await getPlayer(playerData.uid);
          console.log('Found existing player after conflict:', player);
          return player;
        } catch (getError) {
          console.error('Failed to get player after conflict:', getError);
          throw new Error(`Failed to create player: ${errorText}`);
        }
      }
      
      throw new Error(`Failed to create player: ${errorText}`);
    }

    const newPlayer = await response.json();
    console.log('Successfully created new player:', newPlayer);
    return newPlayer;
  } catch (error) {
    console.error('Error in createPlayer:', error);
    throw error;
  }
}; 