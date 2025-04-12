import { useState, useEffect } from 'react'
import './App.css'
import { fetchMissions, fetchPrizes } from './services/api'

function App() {
  const [activeSection, setActiveSection] = useState('missions')
  const [missions, setMissions] = useState([])
  const [prizes, setPrizes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
        
        console.log('Received missions:', missionsData)
        console.log('Received prizes:', prizesData)
        
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

  return (
    <div className="app">
      <header className="header">
        <h1>GameLayer Test</h1>
      </header>
      
      <nav className="navigation">
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
        {error && <div className="error">{error}</div>}
        
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {activeSection === 'missions' && (
              <section className="missions-section">
                <h2>Missions</h2>
                {missions.length === 0 ? (
                  <p className="no-data">No missions available</p>
                ) : (
                  <div className="grid">
                    {missions.map(mission => (
                      <div key={mission.id} className="card">
                        {mission.image && (
                          <img src={mission.image} alt={mission.name} className="card-image" />
                        )}
                        <h3>{mission.name}</h3>
                        <p>{mission.description}</p>
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
                        {prize.image && (
                          <img src={prize.image} alt={prize.name} className="card-image" />
                        )}
                        <h3>{prize.name}</h3>
                        <p>{prize.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default App
