import { useState, useEffect } from 'react'
import './App.css'
import { fetchMissions, fetchPrizes, fetchPlayers, fetchTeam, fetchTeams, fetchPlayer, completeMissionEvent, createPlayer } from './services/api'

function App() {
  const [activeSection, setActiveSection] = useState('profile')
  const [missions, setMissions] = useState(() => {
    const savedMissions = localStorage.getItem('missions');
    return savedMissions ? JSON.parse(savedMissions) : [];
  })
  const [prizes, setPrizes] = useState(() => {
    const savedPrizes = localStorage.getItem('prizes');
    return savedPrizes ? JSON.parse(savedPrizes) : [];
  })
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teams, setTeams] = useState({})
  const [showToast, setShowToast] = useState(false)
  const [activePlayer, setActivePlayer] = useState(() => {
    // Try to load the active player from localStorage
    const savedPlayer = localStorage.getItem('activePlayer');
    if (savedPlayer) {
      const playerData = JSON.parse(savedPlayer);
      return playerData;
    }
    // If no saved player, use judge.steven@gmail.com as default
    return { id: 'judge.steven@gmail.com' };
  })
  const [showSignInModal, setShowSignInModal] = useState(false)
  const [playerIdInput, setPlayerIdInput] = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(() => {
    // Try to load the active player from localStorage
    const savedPlayer = localStorage.getItem('activePlayer');
    return savedPlayer ? JSON.parse(savedPlayer) : null;
  })

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Starting to load data...')
        
        // Fetch teams first
        const teamsData = await fetchTeams();
        const teamsMap = {};
        teamsData.forEach(team => {
          teamsMap[team.id] = team;
        });
        setTeams(teamsMap);
        
        // If we have an active player, fetch their data
        if (activePlayer?.id) {
          try {
            const playerData = await fetchPlayer(activePlayer.id);
            setActivePlayer(playerData);
            localStorage.setItem('activePlayer', JSON.stringify(playerData));
            
            // Fetch missions and prizes for the active player
            const [missionsData, prizesData] = await Promise.all([
              fetchMissions(playerData.id),
              fetchPrizes(playerData.id)
            ]);
            
            setMissions(missionsData);
            setPrizes(prizesData);
            localStorage.setItem('missions', JSON.stringify(missionsData));
            localStorage.setItem('prizes', JSON.stringify(prizesData));
          } catch (error) {
            console.error('Error loading active player data:', error);
            setError('Failed to load player data. Please try signing in again.');
          }
        }
        
        // Fetch all players
        const playersData = await fetchPlayers();
        setPlayers(playersData);
        
      } catch (err) {
        console.error('Error loading data:', err);
        setError(err.message || 'Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getTeamName = (team) => {
    if (!team) return '';
    if (typeof team === 'string') return team;
    if (team.id && teams[team.id]) return teams[team.id].name;
    return team.id || 'Unknown Team';
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    if (!playerIdInput.trim()) {
      setError('Please enter a player ID');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Fetch the player's data from GameLayer
      const playerData = await fetchPlayer(playerIdInput);
      
      // Set the player as active
      setActivePlayer(playerData);
      localStorage.setItem('activePlayer', JSON.stringify(playerData));
      
      // Fetch missions and prizes for the new active player
      const [missionsData, prizesData] = await Promise.all([
        fetchMissions(playerData.id),
        fetchPrizes(playerData.id)
      ]);
      
      setMissions(missionsData);
      setPrizes(prizesData);
      localStorage.setItem('missions', JSON.stringify(missionsData));
      localStorage.setItem('prizes', JSON.stringify(prizesData));
      
      setShowSignInModal(false);
      setPlayerIdInput('');
    } catch (error) {
      console.error('Error signing in:', error);
      setError('Failed to sign in. Please check the player ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSelect = async (player) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch the player's data from GameLayer
      const playerData = await fetchPlayer(player.id);
      
      // Set the player as active
      setActivePlayer(playerData);
      localStorage.setItem('activePlayer', JSON.stringify(playerData));
      
      // Fetch missions and prizes for the new active player
      const [missionsData, prizesData] = await Promise.all([
        fetchMissions(playerData.id),
        fetchPrizes(playerData.id)
      ]);
      
      setMissions(missionsData);
      setPrizes(prizesData);
      localStorage.setItem('missions', JSON.stringify(missionsData));
      localStorage.setItem('prizes', JSON.stringify(prizesData));
      
      // Switch to profile section
      setActiveSection('profile');
    } catch (error) {
      console.error('Error switching player:', error);
      setError('Failed to switch player. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMissionClick = async (mission) => {
    try {
      if (!activePlayer) {
        console.log('No player selected');
        return;
      }

      console.log('Current player:', activePlayer);
      console.log('Selected mission:', mission);

      // Get the event ID from the mission's objectives
      const eventId = mission.objectives?.events?.[0]?.id || mission.objectives?.events?.[0] || '1-test-event';
      console.log('Using event ID:', eventId);

      // Complete the mission
      await completeMissionEvent(activePlayer.id, eventId);
      console.log('Mission completed successfully');

      // Refresh the data
      const updatedMissions = await fetchMissions(activePlayer.id);
      const updatedPlayer = await fetchPlayer(activePlayer.id);
      setMissions(updatedMissions);
      setActivePlayer(updatedPlayer);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Error completing mission:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="app">
      {showToast && (
        <div className="toast">
          Success!
        </div>
      )}
      <header>
        <div className="header-content">
          <a href="/" className="logo">
            <h1>GameLayer</h1>
          </a>
          <nav>
            <button
              className={`nav-button ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <i className="fas fa-user"></i>
              Profile
            </button>
            <button
              className={`nav-button ${activeSection === 'missions' ? 'active' : ''}`}
              onClick={() => setActiveSection('missions')}
            >
              <i className="fas fa-tasks"></i>
              Missions
            </button>
            <button
              className={`nav-button ${activeSection === 'prizes' ? 'active' : ''}`}
              onClick={() => setActiveSection('prizes')}
            >
              <i className="fas fa-gift"></i>
              Prizes
            </button>
            <button
              className={`nav-button ${activeSection === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('leaderboard')}
            >
              <i className="fas fa-trophy"></i>
              Leaderboard
            </button>
            <button
              className={`nav-button ${activeSection === 'players' ? 'active' : ''}`}
              onClick={() => setActiveSection('players')}
            >
              <i className="fas fa-users"></i>
              Players
            </button>
          </nav>
          <div className="auth-section">
            <button 
              className="sign-in-button"
              onClick={() => {
                setShowSignInModal(true);
                setActiveSection('profile');
              }}
            >
              {activePlayer ? 'Switch Player' : 'Sign In'}
            </button>
          </div>
        </div>
      </header>
      
      {showSignInModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Switch Active Player</h2>
            <div className="modal-content">
              <input
                type="text"
                placeholder="Enter Player ID"
                value={playerIdInput}
                onChange={(e) => setPlayerIdInput(e.target.value)}
                className="player-id-input"
              />
              {error && <p className="error-message">{error}</p>}
              <div className="modal-actions">
                <button onClick={handleSignIn} className="modal-button">
                  Switch Player
                </button>
                <button 
                  onClick={() => {
                    setShowSignInModal(false);
                    setPlayerIdInput('');
                    setError(null);
                  }} 
                  className="modal-button cancel"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <main className="content">
        {activeSection === 'profile' && (
          <div className="section">
            {loading ? (
              <div className="loading">Loading profile...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : activePlayer ? (
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <img 
                      src={String(activePlayer.imgUrl) || 'https://via.placeholder.com/150'} 
                      alt={String(activePlayer.name) || 'Player'} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/150';
                      }}
                    />
                  </div>
                  <div className="profile-title">
                    <h2>{String(activePlayer.name) || 'Player Name'}</h2>
                    {activePlayer.team && (
                      <div className="profile-team">
                        <span className="team-label">Team</span>
                        <span className="team-name">{getTeamName(activePlayer.team)}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-stats">
                  <div className="stat-card">
                    <div className="stat-content">
                      <span className="stat-value">{Number(activePlayer.points) || 0}</span>
                      <span className="stat-label">Points</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-content">
                      <span className="stat-value">{Number(activePlayer.credits) || 0}</span>
                      <span className="stat-label">Credits</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-content">
                      <span className="stat-value">{Number(activePlayer.level) || 1}</span>
                      <span className="stat-label">Level</span>
                    </div>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="action-button" onClick={() => setActiveSection('missions')}>
                    Available Missions ({Number(missions.length) || 0})
                  </button>
                  <button className="action-button" onClick={() => setActiveSection('prizes')}>
                    Available Prizes ({Number(prizes.length) || 0})
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-data">No player data available</div>
            )}
          </div>
        )}
        
        {activeSection === 'missions' && (
          <section className="missions-section">
            <h2>Missions</h2>
            {loading ? (
              <div className="loading">Loading missions...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : missions.length === 0 ? (
              <div className="no-data">No missions available</div>
            ) : (
              <div className="missions-grid">
                {missions.map((mission, index) => {
                  const totalSteps = mission.steps?.length || 0;
                  const completedSteps = mission.steps?.filter(step => step.completed)?.length || 0;
                  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
                  
                  console.log('Mission data:', mission); // Debug log
                  
                  return (
                    <div key={`mission-${index}`} className="card mission-card">
                      <div className="card-image">
                        <img 
                          src={mission.imgUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${index}`} 
                          alt={mission.title || 'Mission image'} 
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${index}`;
                          }}
                        />
                      </div>
                      <div className="card-content">
                        <h3>{String(mission.title || `Mission ${index + 1}`)}</h3>
                        <p>{String(mission.description || 'No description available')}</p>
                        <div className="mission-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill" 
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                          <div className="progress-text">
                            {completedSteps} of {totalSteps} steps completed
                          </div>
                        </div>
                        <div className="mission-details">
                          <div>
                            <span className="points">{Number(mission.reward?.points) || 0}</span>
                            <span className="credits">{Number(mission.reward?.credits) || 0}</span>
                          </div>
                          <p style={{ textAlign: 'left' }}>
                            Available until: {mission.active?.to ? new Date(mission.active.to).toLocaleDateString() : 'No expiry'}
                          </p>
                        </div>
                        <button 
                          className={`go-button ${mission.completed || 
                            (mission.active?.to && new Date(mission.active.to) < new Date()) ? 'disabled' : ''}`}
                          onClick={() => {
                            if (!mission.completed && 
                                (!mission.active?.to || new Date(mission.active.to) >= new Date()) &&
                                mission.id !== '1-test-mission') {
                              handleMissionClick(mission);
                            }
                          }}
                          disabled={mission.completed || 
                            (mission.active?.to && new Date(mission.active.to) < new Date())}
                        >
                          GO!
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
        
        {activeSection === 'prizes' && (
          <section className="prizes-section">
            <h2>Prizes</h2>
            {prizes.length === 0 ? (
              <p className="no-data">No prizes available</p>
            ) : (
              <div className="prizes-grid">
                {prizes
                  .filter(prize => {
                    // Only show prizes that the player can afford
                    const playerCredits = Number(activePlayer?.credits) || 0;
                    const prizeCost = Number(prize.credits) || 0;
                    return playerCredits >= prizeCost;
                  })
                  .map((prize, index) => (
                  <div key={`prize-${index}`} className="card prize-card">
                    {prize.imgUrl && (
                      <img 
                        src={String(prize.imgUrl)} 
                        alt={String(prize.name || 'Prize image')} 
                        className="card-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="card-content">
                      <h3>{String(prize.name || 'Unnamed Prize')}</h3>
                      <p>{String(prize.description || 'No description available')}</p>
                      <div className="stock-progress">
                        <div className="progress-bar">
                          <div 
                            className="progress-fill" 
                            style={{ 
                              width: `${((10000 - prize.stock?.available) / 10000) * 100 || 0}%`,
                              backgroundColor: prize.stock?.available > 0 ? '#4CAF50' : '#dc2626'
                            }}
                          ></div>
                        </div>
                        <div className="progress-text">
                          {isNaN(prize.stock?.available) ? 0 : prize.stock?.available} available
                        </div>
                      </div>
                      {prize.credits > 0 && (
                        <span className="credits">{Number(prize.credits)}</span>
                      )}
                      <p>Available until: {prize.active?.to ? new Date(prize.active.to).toLocaleDateString() : 'No expiry'}</p>
                      <button 
                        className={`collect-button ${prize.stock?.available <= 0 || 
                          (prize.active?.to && new Date(prize.active.to) < new Date()) ? 'disabled' : ''}`}
                        onClick={() => {
                          if (prize.stock?.available > 0 && 
                              (!prize.active?.to || new Date(prize.active.to) >= new Date())) {
                            handlePrizeClick(prize);
                          }
                        }}
                        disabled={prize.stock?.available <= 0 || 
                          (prize.active?.to && new Date(prize.active.to) < new Date())}
                      >
                        Collect!
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        
        {activeSection === 'players' && (
          <section className="players-section">
            <h2>Players</h2>
            {loading ? (
              <div className="loading">Loading players...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : players.length === 0 ? (
              <div className="no-data">No players available</div>
            ) : (
              <div className="players-grid">
                {players.map((player, index) => (
                  <div key={`player-${index}`} className="player-card">
                    <div className="player-card-header">
                      <img 
                        src={player.imgUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`} 
                        alt={player.name || 'Player avatar'} 
                        className="player-card-avatar"
                        onError={(e) => {
                          e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`;
                        }}
                      />
                      <h3>{String(player.name || `Player ${index + 1}`)}</h3>
                    </div>
                    <div className="player-card-details">
                      <div className="detail-item">
                        <span className="label">Points:</span>
                        <span className="value">{Number(player.points) || 0}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Credits:</span>
                        <span className="value">{Number(player.credits) || 0}</span>
                      </div>
                      <div className="detail-item">
                        <span className="label">Level:</span>
                        <span className="value">{Number(player.level) || 1}</span>
                      </div>
                      {player.team && (
                        <div className="detail-item">
                          <span className="label">Team:</span>
                          <span className="value">{getTeamName(player.team)}</span>
                        </div>
                      )}
                    </div>
                    <button 
                      className="switch-player-button"
                      onClick={() => handlePlayerSelect(player)}
                    >
                      Switch Player
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        
        {activeSection === 'leaderboard' && (
          <section className="leaderboard-section">
            <h2>Leaderboard</h2>
            {loading ? (
              <div className="loading">Loading leaderboard...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : players.length === 0 ? (
              <div className="no-data">No players available</div>
            ) : (
              <div className="leaderboard">
                {[...players]
                  .sort((a, b) => (Number(b.points) || 0) - (Number(a.points) || 0))
                  .map((player, index) => (
                    <div 
                      key={`leaderboard-${index}`} 
                      className={`leaderboard-row ${player.name === activePlayer?.name ? 'active-player' : ''}`}
                    >
                      <div className="rank">{index + 1}</div>
                      <div className="player-info">
                        <img 
                          src={player.imgUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`} 
                          alt={player.name || 'Player avatar'} 
                          className="player-avatar"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`;
                          }}
                        />
                        <div className="player-details">
                          <span className="player-name">{String(player.name || `Player ${index + 1}`)}</span>
                          {player.team && (
                            <span className="team-name">{getTeamName(player.team)}</span>
                          )}
                        </div>
                      </div>
                      <div className="score">
                        <i className="fas fa-star"></i>
                        {Number(player.points) || 0}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        )}
      </main>
      </div>
  )
}

export default App
