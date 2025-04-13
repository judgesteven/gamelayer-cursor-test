import { useState, useEffect } from 'react'
import './App.css'
import { fetchMissions, fetchPrizes, fetchPlayers, fetchTeam, fetchTeams } from './services/api'

function App() {
  const [activeSection, setActiveSection] = useState('profile')
  const [missions, setMissions] = useState([])
  const [prizes, setPrizes] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teams, setTeams] = useState({})
  const [activePlayer, setActivePlayer] = useState(null)

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
        
        const [playersData] = await Promise.all([
          fetchPlayers()
        ])
        
        console.log('Players data structure:', JSON.stringify(playersData, null, 2))
        
        // Find Johnny Marr and set as active player
        const johnnyMarr = playersData.find(player => player.name === 'Johnny Marr')
        setActivePlayer(johnnyMarr || playersData[0])

        // Fetch missions for the active player
        const missionsData = await fetchMissions(johnnyMarr?.id || playersData[0]?.id)
        setMissions(missionsData || [])

        // Fetch prizes for the active player
        const prizesData = await fetchPrizes(johnnyMarr?.id || playersData[0]?.id)
        setPrizes(prizesData || [])
        setPlayers(Array.isArray(playersData) ? playersData : [])
      } catch (err) {
        console.error('Error in loadData:', err)
        setError(err.message || 'Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const getTeamName = (team) => {
    if (!team) return '';
    if (typeof team === 'string') return team;
    if (team.id && teams[team.id]) return teams[team.id].name;
    return team.id || 'Unknown Team';
  };

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="app">
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
              className={`nav-button ${activeSection === 'players' ? 'active' : ''}`}
              onClick={() => setActiveSection('players')}
            >
              <i className="fas fa-users"></i>
              Players
            </button>
            <button
              className={`nav-button ${activeSection === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('leaderboard')}
            >
              <i className="fas fa-trophy"></i>
              Leaderboard
            </button>
          </nav>
          <div className="auth-section">
            <button className="sign-in-button">
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </button>
          </div>
        </div>
      </header>
      
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
            {missions.length === 0 ? (
              <p className="no-data">No missions available</p>
            ) : (
              <div className="grid">
                {missions.map((mission, index) => (
                  <div key={`mission-${index}`} className="card">
                    {mission.imgUrl && (
                      <img 
                        src={String(mission.imgUrl)} 
                        alt={String(mission.name || 'Mission image')} 
                        className="card-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <div className="card-content">
                      <h3>{String(mission.name || 'Unnamed Mission')}</h3>
                      <p>{String(mission.description || 'No description available')}</p>
                      <div className="mission-details">
                        <span className="points">{Number(mission.reward?.points || 0)}</span>
                        <span className="credits">{Number(mission.reward?.credits || 0)}</span>
                        <p>Available until: {mission.active?.to ? new Date(mission.active.to).toLocaleDateString() : 'No expiry'}</p>
                      </div>
                      <button className="go-button">GO!</button>
                    </div>
                  </div>
                ))}
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
              <div className="grid">
                {prizes
                  .filter(prize => {
                    // Only show prizes that the player can afford
                    const playerCredits = Number(activePlayer?.credits) || 0;
                    const prizeCost = Number(prize.credits) || 0;
                    return playerCredits >= prizeCost;
                  })
                  .map((prize, index) => (
                  <div key={`prize-${index}`} className="card">
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
                      <div className="prize-details">
                        {prize.credits > 0 && (
                          <span className="credits">{Number(prize.credits)}</span>
                        )}
                        <span className="stock">Stock: {String(prize.stock?.available || 'Unlimited')}</span>
                        <p>Available until: {prize.active?.to ? new Date(prize.active.to).toLocaleDateString() : 'No expiry'}</p>
                      </div>
                      <button className="collect-button">Collect!</button>
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
