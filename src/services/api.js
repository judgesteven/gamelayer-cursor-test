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

export const fetchMissions = async () => {
  try {
    const url = `${API_BASE_URL}/missions?account=${ACCOUNT_ID}`;
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

export const fetchPrizes = async () => {
  try {
    const url = `${API_BASE_URL}/prizes?account=${ACCOUNT_ID}`;
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