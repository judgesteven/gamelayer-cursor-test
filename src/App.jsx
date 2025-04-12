import { useState, useEffect } from 'react'
import './App.css'
import { fetchMissions, fetchPrizes, fetchPlayers, fetchTeam, createPlayer } from './services/api'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/AuthForm'

function AppContent() {
  const [activeSection, setActiveSection] = useState('profile')
  const [missions, setMissions] = useState([])
  const [prizes, setPrizes] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teams, setTeams] = useState({})
  const { user, logout } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Starting to load data...')
        
        const [missionsData, prizesData, playersData] = await Promise.all([
          fetchMissions(),
          fetchPrizes(),
          fetchPlayers()
        ])
        
        console.log('Players data structure:', JSON.stringify(playersData, null, 2))
        
        setMissions(missionsData || [])
        setPrizes(prizesData || [])
        setPlayers(Array.isArray(playersData) ? playersData : [])

        // Fetch team details for each unique team ID
        const teamIds = new Set();
        playersData.forEach(player => {
          if (player.team && player.team.id) {
            teamIds.add(player.team.id);
          }
        });

        const teamPromises = Array.from(teamIds).map(teamId => 
          fetchTeam(teamId)
            .then(teamData => ({ [teamId]: teamData }))
            .catch(error => {
              console.error(`Error fetching team ${teamId}:`, error);
              return { [teamId]: { name: `Team ${teamId}` } };
            })
        );

        const teamResults = await Promise.all(teamPromises);
        const teamsMap = teamResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setTeams(teamsMap);
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

  if (!user) {
    return <AuthForm />;
  }

  if (loading) {
    return <div className="loading">Loading...</div>
  }

  if (error) {
    return <div className="error">{error}</div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>GameLayer Test</h1>
        <button onClick={logout} className="logout-button">Logout</button>
      </header>
      
      <nav className="navigation">
        <button 
          className={activeSection === 'profile' ? 'active' : ''}
          onClick={() => setActiveSection('profile')}
        >
          Profile
        </button>
        <button 
          className={activeSection === 'missions' ? 'active' : ''}
          onClick={() => setActiveSection('missions')}
        >
          Missions
        </button>
        <button 
          className={activeSection === 'prizes' ? 'active' : ''}
          onClick={() => setActiveSection('prizes')}
        >
          Prizes
        </button>
        <button 
          className={activeSection === 'leaderboard' ? 'active' : ''}
          onClick={() => setActiveSection('leaderboard')}
        >
          Leaderboard
        </button>
        <button 
          className={activeSection === 'players' ? 'active' : ''}
          onClick={() => setActiveSection('players')}
        >
          Players
        </button>
      </nav>

      <main className="content">
        {activeSection === 'profile' && (
          <div className="section">
            <div className="profile-card">
              <div className="profile-header">
                <div className="profile-avatar">
                  <img 
                    src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=random`}
                    alt={user.username}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/150';
                    }}
                  />
                </div>
                <div className="profile-title">
                  <h2>{user.username}</h2>
                  <div className="profile-email">{user.email}</div>
                </div>
              </div>
              <div className="profile-stats">
                <div className="stat-card">
                  <div className="stat-icon">🏆</div>
                  <div className="stat-content">
                    <span className="stat-value">{user.points || 0}</span>
                    <span className="stat-label">Points</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-content">
                    <span className="stat-value">{user.credits || 0}</span>
                    <span className="stat-label">Credits</span>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⭐</div>
                  <div className="stat-content">
                    <span className="stat-value">{user.level || 1}</span>
                    <span className="stat-label">Level</span>
                  </div>
                </div>
              </div>
              <div className="profile-actions">
                <button className="action-button" onClick={() => setActiveSection('missions')}>
                  View Missions ({missions.length})
                </button>
                <button className="action-button" onClick={() => setActiveSection('prizes')}>
                  View Prizes ({prizes.length})
                </button>
              </div>
            </div>
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
                        <span className="points">Points: {Number(mission.reward?.points || 0)}</span>
                        <span className="credits">Credits: {Number(mission.reward?.credits || 0)}</span>
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
                {prizes.map((prize, index) => (
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
                        <span className="credits">Credits: {Number(prize.points_required || 0)}</span>
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
        
        {activeSection === 'leaderboard' && (
          <section className="leaderboard-section">
            <h2>Leaderboard</h2>
            {loading ? (
              <div className="loading">Loading leaderboard...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : players.length === 0 ? (
              <p className="no-data">No leaderboard data available</p>
            ) : (
              <div className="leaderboard">
                <div className="leaderboard-header">
                  <span className="rank">Rank</span>
                  <span className="player">Player</span>
                  <span className="score">Points</span>
                </div>
                {[...players]
                  .sort((a, b) => (b.points || 0) - (a.points || 0))
                  .map((player, index) => (
                    <div key={`leaderboard-${index}`} className="leaderboard-row">
                      <span className="rank">{index + 1}</span>
                      <div className="player-info">
                        <img 
                          src={player.imgUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`} 
                          alt={player.name || 'Player avatar'} 
                          className="player-avatar"
                          onError={(e) => {
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`;
                          }}
                        />
                        <span className="player-name">{String(player.name || `Player ${index + 1}`)}</span>
                      </div>
                      <span className="score">{Number(player.points || 0)}</span>
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
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
