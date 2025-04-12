import { useState, useEffect } from 'react'
import './App.css'
import { fetchMissions, fetchPrizes } from './services/api'

function App() {
  const [activeSection, setActiveSection] = useState('profile')
  const [missions, setMissions] = useState([])
  const [prizes, setPrizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const getImageUrl = (imageName) => {
    if (!imageName) return null;
    return `https://images.gamelayer.co/glimages/new-account-content/${imageName}`;
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('Starting to load data...')
        
        const [missionsData, prizesData] = await Promise.all([
          fetchMissions(),
          fetchPrizes()
        ])
        
        // Log the first mission and prize in detail
        if (missionsData.length > 0) {
          console.log('First mission:', JSON.stringify(missionsData[0], null, 2));
        }
        if (prizesData.length > 0) {
          console.log('First prize:', JSON.stringify(prizesData[0], null, 2));
          console.log('Prize fields:', Object.keys(prizesData[0]));
        }
        
        // Check if the data is in the expected format
        if (!Array.isArray(missionsData)) {
          throw new Error('Missions data is not in the expected format')
        }
        if (!Array.isArray(prizesData)) {
          throw new Error('Prizes data is not in the expected format')
        }
        
        setMissions(missionsData)
        setPrizes(prizesData)
      } catch (err) {
        console.error('Error in loadData:', err)
        setError(err.message || 'Failed to load data. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
      </nav>

      <main className="content">
        {activeSection === 'profile' && (
          <section className="profile">
            <h2>Profile</h2>
            <div className="profile-card">
              <div className="profile-info">
                <h3>Welcome to GameLayer</h3>
                <p>Complete missions to earn points and redeem prizes!</p>
                <div className="profile-stats">
                  <p>Total Missions: {missions.length}</p>
                  <p>Available Prizes: {prizes.length}</p>
                </div>
              </div>
            </div>
          </section>
        )}
        
        {activeSection === 'missions' && (
          <section className="missions-section">
            <h2>Missions</h2>
            {missions.length === 0 ? (
              <p className="no-data">No missions available</p>
            ) : (
              <div className="grid">
                {missions.map(mission => (
                  <div key={mission.id} className="card">
                    {mission.imgUrl && (
                      <img 
                        src={mission.imgUrl} 
                        alt={mission.name || 'Mission image'} 
                        className="card-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <h3>{mission.name}</h3>
                    <p>{mission.description}</p>
                    <div className="mission-details">
                      <p>Points: {mission.reward?.points || 0}</p>
                      <p>Credits: {mission.reward?.credits || 0}</p>
                      <p>Available until: {new Date(mission.active?.to).toLocaleDateString()}</p>
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
                {prizes.map(prize => (
                  <div key={prize.id} className="card">
                    {prize.imgUrl && (
                      <img 
                        src={prize.imgUrl} 
                        alt={prize.name || 'Prize image'} 
                        className="card-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    )}
                    <h3>{prize.name}</h3>
                    <p>{prize.description}</p>
                    <div className="prize-details">
                      <p>Credits: {prize.points_required || 0}</p>
                      <p>Stock: {prize.stock?.available || 'Unlimited'}</p>
                      <p>Available until: {prize.active?.to ? new Date(prize.active.to).toLocaleDateString() : 'No expiry'}</p>
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
