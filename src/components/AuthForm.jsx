import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { createPlayer, fetchPlayers } from '../services/api';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    // Fetch existing players when component mounts
    const loadPlayers = async () => {
      try {
        const playersData = await fetchPlayers();
        setPlayers(playersData);
      } catch (err) {
        console.error('Error loading players:', err);
      }
    };
    loadPlayers();
  }, []);

  const actionCodeSettings = {
    url: window.location.origin,
    handleCodeInApp: true,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Send sign-in link for sign-up
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        window.localStorage.setItem('nameForSignIn', name);
        setEmailSent(true);
      } else {
        // Send sign-in link for sign-in
        await sendSignInLinkToEmail(auth, email, actionCodeSettings);
        window.localStorage.setItem('emailForSignIn', email);
        setEmailSent(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check if we're returning from an email link
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    let name = window.localStorage.getItem('nameForSignIn');
    
    if (!email) {
      email = window.prompt('Please provide your email for confirmation');
    }

    signInWithEmailLink(auth, email, window.location.href)
      .then(async (result) => {
        window.localStorage.removeItem('emailForSignIn');
        
        // Check if user already exists in GameLayer
        const existingPlayer = players.find(player => player.email === email);
        
        if (name && !existingPlayer) {
          // Only create player if it's a new sign-up and they don't exist in GameLayer
          await createPlayer({
            name: name,
            email: email,
            uid: result.user.uid
          });
          window.localStorage.removeItem('nameForSignIn');
        }
      })
      .catch((error) => {
        setError(error.message);
      });
  }

  return (
    <div className="auth-form">
      <h2>{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
      {error && <div className="error">{error}</div>}
      {emailSent ? (
        <div className="email-sent">
          <h3>Check your email!</h3>
          <p>We've sent a magic link to {email}. Click the link to {isSignUp ? 'sign up' : 'sign in'}.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {isSignUp && (
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
              />
            </div>
          )}
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>
          <button type="submit" disabled={loading} className="submit-button">
            {loading ? 'Sending...' : isSignUp ? 'Send Sign Up Link' : 'Send Sign In Link'}
          </button>
        </form>
      )}
      {!emailSent && (
        <button
          className="toggle-auth"
          onClick={() => setIsSignUp(!isSignUp)}
          disabled={loading}
        >
          {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
        </button>
      )}
    </div>
  );
} 