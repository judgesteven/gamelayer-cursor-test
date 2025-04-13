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

    const missionsData = await response.json();
    console.log('Missions data from API:', missionsData);
    return missionsData;
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

    return await response.json();
  } catch (error) {
    console.error('Error fetching prizes:', error);
    throw error;
  }
};

export const fetchPlayers = async () => {
  try {
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
    } else {
      console.warn('Unexpected players data format:', data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching players:', error);
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

export const fetchTeams = async () => {
  try {
    const url = `${API_BASE_URL}/teams?account=${ACCOUNT_ID}`;
    const response = await fetch(url, {
      headers: baseHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Teams Error:', errorText);
      throw new Error('Failed to fetch teams');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};

export const fetchPlayer = async (playerId) => {
  try {
    const url = `${API_BASE_URL}/players/${playerId}?account=${ACCOUNT_ID}`;
    const response = await fetch(url, {
      headers: baseHeaders
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Player Error:', errorText);
      throw new Error('Failed to fetch player');
    }

    const playerData = await response.json();
    // Add the player ID to the returned data
    return { ...playerData, id: playerId };
  } catch (error) {
    console.error('Error fetching player:', error);
    throw error;
  }
};

export const completeMissionEvent = async (playerId, eventId) => {
  try {
    const url = `${API_BASE_URL}/events/${eventId}/complete?player=${playerId}&account=${ACCOUNT_ID}`;
    console.log('Making API call to:', url);
    console.log('Request headers:', baseHeaders);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({
        player: playerId,
        completed_at: new Date().toISOString(),
        status: 'completed'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('Response body:', responseText);

    if (!response.ok) {
      console.error('Complete Mission Event Error:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseText
      });
      throw new Error(`Failed to complete mission event: ${response.status} ${response.statusText}`);
    }

    return JSON.parse(responseText);
  } catch (error) {
    console.error('Error completing mission event:', {
      error: error.message,
      stack: error.stack,
      url: `${API_BASE_URL}/events/${eventId}/complete?player=${playerId}&account=${ACCOUNT_ID}`
    });
    throw error;
  }
};

export const createPlayer = async (playerId) => {
  try {
    const url = `${API_BASE_URL}/players?account=${ACCOUNT_ID}`;
    console.log('Creating player:', playerId);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: baseHeaders,
      body: JSON.stringify({
        player: playerId,
        name: playerId,
        account: ACCOUNT_ID
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Create Player Error:', errorText);
      throw new Error('Failed to create player');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating player:', error);
    throw error;
  }
}; 