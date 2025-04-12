import { useState, useEffect } from 'react'
import './App.css'
import { fetchMissions, fetchPrizes, fetchPlayers, fetchTeam, createPlayer, getPlayer } from './services/api'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { AuthForm } from './components/AuthForm'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'

function AppContent() {
  const [activeSection, setActiveSection] = useState('profile')
  const [missions, setMissions] = useState([])
  const [prizes, setPrizes] = useState([])
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [teams, setTeams] = useState({})
  const [currentPlayer, setCurrentPlayer] = useState(null)
  const { currentUser } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Fetch current player's data if logged in
        if (currentUser) {
          try {
            const playerData = await getPlayer(currentUser.uid)
            setCurrentPlayer(playerData)
            
            // Fetch team data if player has a team
            if (playerData?.team?.id) {
              const teamData = await fetchTeam(playerData.team.id)
              setTeams(prevTeams => ({
                ...prevTeams,
                [playerData.team.id]: teamData
              }))
            }
          } catch (playerError) {
            console.error('Error fetching current player:', playerError)
            setCurrentPlayer(null)
          }
        }

        // Fetch other data
        const [playersData, missionsData, prizesData] = await Promise.all([
          fetchPlayers(),
          fetchMissions(currentUser?.uid),
          fetchPrizes(currentUser?.uid)
        ])
        
        setPlayers(playersData || [])
        setMissions(missionsData || [])
        setPrizes(prizesData || [])
      } catch (err) {
        console.error('Error in loadData:', err)
        setError(err.message || 'Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [currentUser])

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (!currentUser) {
    return <AuthForm />
  }

  const getTeamName = (team) => {
    if (!team) return ''
    if (typeof team === 'string') return team
    if (team.id && teams[team.id]) return teams[team.id].name
    return team.id || 'Unknown Team'
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
        <div className="header-content">
          <div className="header-left">
            <h1>GameLayer</h1>
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
                className={activeSection === 'players' ? 'active' : ''}
                onClick={() => setActiveSection('players')}
              >
                Players
              </button>
              <button
                className={activeSection === 'leaderboard' ? 'active' : ''}
                onClick={() => setActiveSection('leaderboard')}
              >
                Leaderboard
              </button>
            </nav>
          </div>
          <div className="user-status">
            <span className="user-email">{currentUser?.email}</span>
            <button className="logout-button" onClick={handleLogout}>
              EXIT
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
            ) : currentPlayer ? (
              <div className="profile-card">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <img 
                      src={currentPlayer.imgUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`} 
                      alt={currentPlayer.name} 
                      onError={(e) => {
                        e.target.onerror = null
                        e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.email}`
                      }}
                    />
                  </div>
                  <div className="profile-title">
                    <h2>{currentPlayer.name}</h2>
                    {currentPlayer.team && (
                      <div className="profile-team">
                        {getTeamName(currentPlayer.team)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="profile-stats">
                  <div className="stat-item" key="level">
                    <span className="stat-label">Level</span>
                    <span className="stat-value">
                      {currentPlayer.level?.current || 1}
                      {currentPlayer.level?.experience !== undefined && (
                        <span className="experience">({currentPlayer.level.experience} XP)</span>
                      )}
                    </span>
                  </div>
                  <div className="stat-item" key="points">
                    <span className="stat-label">Points</span>
                    <span className="stat-value">{currentPlayer.points || 0}</span>
                  </div>
                  <div className="stat-item" key="credits">
                    <span className="stat-label">Credits</span>
                    <span className="stat-value">{currentPlayer.credits || 0}</span>
                  </div>
                </div>
                <div className="profile-actions">
                  <button className="action-button" onClick={() => setActiveSection('missions')}>
                    View Missions ({Number(missions.length) || 0})
                  </button>
                  <button className="action-button" onClick={() => setActiveSection('prizes')}>
                    View Prizes ({Number(prizes.length) || 0})
                  </button>
                </div>
              </div>
            ) : (
              <div className="no-data">No player data available</div>
            )}
          </div>
        )}
        
        {activeSection === 'missions' && (
          <div className="section">
            <h2>Missions</h2>
            {loading ? (
              <div className="loading">Loading missions...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : missions.length === 0 ? (
              <p className="no-data">No missions available</p>
            ) : (
              <div className="missions-grid">
                {missions.map((mission) => (
                  <div key={`mission-${mission.id || mission.name}`} className="mission-card">
                    <div className="mission-image">
                      <img 
                        src={mission.imgUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${mission.name}`}
                        alt={mission.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${mission.name}`;
                        }}
                      />
                    </div>
                    <div className="mission-content">
                      <h3>{mission.name}</h3>
                      <p>{mission.description}</p>
                      <div className="mission-rewards">
                        <span>+{mission.reward?.points || 0} points</span>
                        <span className="credits">+{mission.reward?.credits || 0} credits</span>
                      </div>
                      <button className="mission-button">GO!</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeSection === 'prizes' && (
          <div className="section">
            <h2>Prizes</h2>
            {loading ? (
              <div className="loading">Loading prizes...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : prizes.length === 0 ? (
              <p className="no-data">No prizes available</p>
            ) : (
              <div className="prizes-grid">
                {prizes.map((prize) => (
                  <div key={`prize-${prize.id || prize.name}`} className="prize-card">
                    <div className="prize-image">
                      <img 
                        src={prize.imgUrl || `https://api.dicebear.com/7.x/shapes/svg?seed=${prize.name}`}
                        alt={prize.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${prize.name}`;
                        }}
                      />
                    </div>
                    <div className="prize-content">
                      <h3>{prize.name}</h3>
                      <p>{prize.description}</p>
                      <div className="prize-rewards">
                        <span className="credits">-{prize.credits || 0} credits</span>
                        <span className="stock">Stock: {prize.stock?.available || 'Unlimited'}</span>
                      </div>
                      <button className="prize-button">Redeem Prize</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeSection === 'leaderboard' && (
          <section className="leaderboard-section">
            <div className="leaderboard">
              <div className="leaderboard-header">
                <div key="rank-header">Rank</div>
                <div key="player-header">Player</div>
                <div key="points-header">Points</div>
              </div>
              {(() => {
                const sortedPlayers = [...players].sort((a, b) => b.points - a.points);
                const maxPoints = sortedPlayers[0]?.points || 1;
                
                return sortedPlayers.map((player, index) => {
                  const progressWidth = (player.points / maxPoints) * 100;
                  
                  return (
                    <div 
                      key={`player-${player.id || player.email || index}`}
                      className={`leaderboard-row ${currentUser?.email === player.email ? 'current-user' : ''}`}
                      style={{ '--progress-width': `${progressWidth}%` }}
                    >
                      <div className="rank">{index + 1}</div>
                      <div className="player-info">
                        <div className="player-avatar">
                          <img 
                            src={player.imgUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.email}`}
                            alt={player.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.email}`;
                            }}
                          />
                        </div>
                        <div>
                          <div className="player-name">{player.name}</div>
                          <div className="player-team">{player.team || 'No Team'}</div>
                        </div>
                      </div>
                      <div className="score">{player.points || 0}</div>
                    </div>
                  );
                });
              })()}
            </div>
          </section>
        )}
        
        {activeSection === 'players' && (
          <div className="section">
            <h2>Players</h2>
            {loading ? (
              <div className="loading">Loading players...</div>
            ) : error ? (
              <div className="error">{error}</div>
            ) : players.length === 0 ? (
              <p className="no-data">No players found</p>
            ) : (
              <div className="players-grid">
                {players.map((player, index) => (
                  <div 
                    key={player.id} 
                    className={`player-card ${player.email === currentUser.email ? 'current-user' : ''}`}
                  >
                    <div className="player-card-header">
                      <div className="player-avatar-container">
                        <img 
                          className="player-card-avatar"
                          src={player.imgUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.email}`}
                          alt={player.name}
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${player.email}`;
                          }}
                        />
                      </div>
                      <div className="player-info">
                        <h3 className="player-name">{player.name}</h3>
                        <span className="player-team-badge">{getTeamName(player.team)}</span>
                      </div>
                    </div>
                    <div className="player-card-stats">
                      <div className="stat-item">
                        <span className="stat-label">Level</span>
                        <span className="stat-value">
                          {player.level?.current || 1}
                          {player.level?.experience !== undefined && (
                            <span className="experience">({player.level.experience} XP)</span>
                          )}
                        </span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Points</span>
                        <span className="stat-value">{player.points || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">Credits</span>
                        <span className="stat-value">{player.credits || 0}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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