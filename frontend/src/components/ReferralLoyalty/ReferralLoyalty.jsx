import React, { useContext, useState, useEffect } from 'react';
import { StoreContext } from "../../Context/StoreContext";
import './ReferralLoyalty.css';

const ReferralLoyalty = () => {
  const { loyaltyRewards, addReferralPoints } = useContext(StoreContext);
  const [referralEmail, setReferralEmail] = useState('');
  const [notification, setNotification] = useState('');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Load the user's theme preference from localStorage on initial render
    const savedTheme = localStorage.getItem('theme') === 'dark';
    setDarkMode(savedTheme);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    localStorage.setItem('theme', !darkMode ? 'dark' : 'light');
  };

  const handleReferralSubmit = (e) => {
    e.preventDefault();
    addReferralPoints(referralEmail);
    setReferralEmail('');
    setNotification('Referral sent successfully!');
    setTimeout(() => setNotification(''), 3000);
  };

  return (
    <div className={`referral-loyalty-container ${darkMode ? 'dark' : ''}`}>
      <h2>Referral & Loyalty Rewards</h2>

      {notification && <div className="notification animated fade-in">{notification}</div>}

      <div className="theme-toggle">
        <label>
          <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
          Toggle Dark Mode
        </label>
      </div>

      <div className="referral-loyalty-content">
        <div className="loyalty-section">
          <h3>Your Loyalty Points</h3>
          <p>You have <span className="points-count">{loyaltyRewards}</span> points.</p>
          <p>Redeem your points for discounts on future orders!</p>

          <div className="progress-bar-container">
            <div
              className="progress-bar-fill"
              style={{ width: `${Math.min((loyaltyRewards / 500) * 100, 100)}%` }}
            />
          </div>
          <p className="progress-bar-text">{loyaltyRewards} / 500 points to unlock your next reward!</p>
          {loyaltyRewards >= 500 && (
            <div className="reward-unlocked">
              <p>🎉 You've unlocked a reward! Use it now!</p>
            </div>
          )}
        </div>

        <div className="referral-section">
          <h3>Refer a Friend</h3>
          <form onSubmit={handleReferralSubmit} className="referral-form">
            <input
              type="email"
              value={referralEmail}
              onChange={(e) => setReferralEmail(e.target.value)}
              placeholder="Enter friend's email"
              required
            />
            <button type="submit" className="submit-referral">Send Referral</button>
          </form>
          <p className="referral-incentive">Earn <span className="highlight-points">100 points</span> for every successful referral!</p>

          <div className="referral-link-section">
            <p>Or share your referral link:</p>
            <div className="copy-link-container">
              <input type="text" value="https://Cravezy.com/referral" readOnly />
              <button className="copy-link-btn">Copy Link</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralLoyalty;
