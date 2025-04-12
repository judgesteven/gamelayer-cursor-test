const API_BASE_URL = 'https://api.gamelayer.co/api/v0';
const ACCOUNT_ID = 'simple-account';
const API_KEY = '5d144874e97c38153da0f72d754c2f64';

const headers = {
  'Authorization': API_KEY,
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Account-ID': ACCOUNT_ID
};

export const fetchMissions = async () => {
  try {
    console.log('Fetching missions...');
    const url = `${API_BASE_URL}/missions?account_id=${ACCOUNT_ID}`;
    console.log('Request URL:', url);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('Missions response status:', response.status);
    console.log('Missions response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Missions error response:', errorText);
      throw new Error(`Failed to fetch missions: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const data = await response.json();
    console.log('Missions data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching missions:', error);
    return [];
  }
};

export const fetchPrizes = async () => {
  try {
    console.log('Fetching prizes...');
    const url = `${API_BASE_URL}/prizes?account_id=${ACCOUNT_ID}`;
    console.log('Request URL:', url);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
      mode: 'cors',
      credentials: 'omit'
    });
    
    console.log('Prizes response status:', response.status);
    console.log('Prizes response headers:', Object.fromEntries(response.headers.entries()));
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Prizes error response:', errorText);
      throw new Error(`Failed to fetch prizes: ${response.status} ${response.statusText}\n${errorText}`);
    }
    
    const data = await response.json();
    console.log('Prizes data:', data);
    return data;
  } catch (error) {
    console.error('Error fetching prizes:', error);
    return [];
  }
}; 