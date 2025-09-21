import React, { useContext, useState, useEffect, useRef } from 'react';
import { StoreContext } from "../../Context/StoreContext";
import './ReferralLoyalty.css';

// SVG Icons
const CopyIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ShareIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="18" cy="5" r="3"></circle>
    <circle cx="6" cy="12" r="3"></circle>
    <circle cx="18" cy="19" r="3"></circle>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
  </svg>
);

const GiftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 12 20 22 4 22 4 12"></polyline>
    <rect x="2" y="7" width="20" height="5"></rect>
    <line x1="12" y1="22" x2="12" y2="7"></line>
    <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
    <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
  </svg>
);

const AwardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="7"></circle>
    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CoinIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
  </svg>
);

const ReferralLoyalty = () => {
  const { loyaltyPoints, addReferralPoints } = useContext(StoreContext);
  const loyaltyRewards = Number(loyaltyPoints) || 0;
  const [referralEmail, setReferralEmail] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('rewards');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [referralHistory, setReferralHistory] = useState([
    { id: 1, email: 'friend1@example.com', date: '2025-01-15', status: 'successful' },
    { id: 2, email: 'friend2@example.com', date: '2025-01-20', status: 'pending' },
    { id: 3, email: 'friend3@example.com', date: '2025-02-01', status: 'successful' },
  ]);
  const [rewards, setRewards] = useState([
    { id: 1, name: "10% Discount", points: 500, description: "Get 10% off on your next order!" },
    { id: 2, name: "Free Delivery", points: 300, description: "Free delivery on your next order!" },
    { id: 3, name: "Free Appetizer", points: 200, description: "Get a free appetizer on orders above $20!" },
  ]);
  
  const shareRef = useRef(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareRef.current && !shareRef.current.contains(event.target)) {
        setShowShareOptions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);



  const handleReferralSubmit = (e) => {
    e.preventDefault();
    if (!referralEmail.match(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      setNotification({ message: 'Please enter a valid email address', type: 'error' });
      return;
    }
    
    addReferralPoints(referralEmail);
    
    const newReferral = {
      id: referralHistory.length + 1,
      email: referralEmail,
      date: new Date().toISOString().split('T')[0],
      status: 'pending'
    };
    setReferralHistory([newReferral, ...referralHistory]);
    
    setReferralEmail('');
    setNotification({ 
      message: 'Referral sent successfully! 100 points will be added once your friend signs up', 
      type: 'success'
    });
    
    setTimeout(() => setNotification({ message: '', type: '' }), 4000);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText('https://Cravezy.com/referral');
    setCopied(true);
    setNotification({ message: 'Link copied to clipboard!', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
    setTimeout(() => setNotification({ message: '', type: '' }), 3000);
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Cravezy!',
        text: 'Get amazing food delivered to your doorstep. Use my referral link to get a discount!',
        url: 'https://Cravezy.com/referral',
      })
      .catch(console.error);
    } else {
      setShowShareOptions(!showShareOptions);
    }
  };

  const redeemReward = (reward) => {
    if (loyaltyRewards >= reward.points) {
      setNotification({ 
        message: `You've redeemed ${reward.name}! Your reward code has been sent to your email.`, 
        type: 'success' 
      });
      setTimeout(() => setNotification({ message: '', type: '' }), 4000);
    } else {
      setNotification({ 
        message: `You need ${reward.points - loyaltyRewards} more points to redeem ${reward.name}`, 
        type: 'error' 
      });
      setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    }
  };

  const calculateLevel = () => {
    return Math.floor(loyaltyRewards / 500) + 1;
  };

  const calculateProgress = () => {
    return Math.min((loyaltyRewards % 500) / 500 * 100, 100);
  };

  return (
    <div className="referral-loyalty-container">
      <div className="rl-header">
        <h2>Referral & Loyalty Rewards</h2>

      </div>

      {notification.message && (
        <div 
          className={`notification animated fade-in ${notification.type}`}
        >
          {notification.message}
        </div>
      )}

      <div className="rl-tabs">
        <button 
          className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          <GiftIcon /> Rewards
        </button>
        <button 
          className={`tab-btn ${activeTab === 'referrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('referrals')}
        >
          <AwardIcon /> Refer Friends
        </button>
      </div>

      <div className="referral-loyalty-content">
        {activeTab === 'rewards' && (
          <div className="loyalty-section">
            <div className="points-card">
              <div className="points-header">
                <CoinIcon />
                <h3>Your Loyalty Points</h3>
              </div>
              <div className="points-display">
                <span className="points-count">{loyaltyRewards}</span>
                <span className="points-label">POINTS</span>
              </div>
              <div className="level-indicator">
                Level {calculateLevel()} <span className="level-badge">Bronze</span>
              </div>
              
              <div className="progress-container">
                <div className="progress-labels">
                  <span>0</span>
                  <span>{calculateLevel() * 500} points for next level</span>
                  <span>{calculateLevel() * 500}</span>
                </div>
                <div className="progress-bar-container">
                  <div 
                    className="progress-bar-fill"
                    style={{ width: `${calculateProgress()}%` }}
                  />
                </div>
              </div>
              
              <p className="redeem-info">
                Redeem your points for discounts on future orders!
                You need <span className="highlight">{Math.max(0, 500 - (loyaltyRewards % 500))}</span> more points for next reward.
              </p>
            </div>

            <div className="rewards-catalog">
              <h3>Available Rewards</h3>
              <div className="rewards-grid">
                {rewards.map((reward) => (
                  <div 
                    key={reward.id}
                    className={`reward-card ${loyaltyRewards >= reward.points ? 'redeemable' : ''}`}
                  >
                    <div className="reward-header">
                      <div className="reward-cost">
                        <CoinIcon /> {reward.points}
                      </div>
                      <div className="reward-badge">
                        {loyaltyRewards >= reward.points ? 'Redeemable' : 'Earn More'}
                      </div>
                    </div>
                    <h4>{reward.name}</h4>
                    <p>{reward.description}</p>
                    <button 
                      className={`redeem-btn ${loyaltyRewards >= reward.points ? '' : 'disabled'}`}
                      onClick={() => redeemReward(reward)}
                    >
                      {loyaltyRewards >= reward.points ? 'Redeem Now' : `Need ${Math.max(0, reward.points - loyaltyRewards)} more`}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'referrals' && (
          <div className="referral-section">
            <div className="referral-card">
              <h3>Refer a Friend</h3>
              <p className="referral-subtitle">
                Earn <span className="highlight-points">100 points</span> for every friend who signs up using your referral
              </p>
              
              <form onSubmit={handleReferralSubmit} className="referral-form">
                <div className="input-group">
                  <input
                    type="email"
                    value={referralEmail}
                    onChange={(e) => setReferralEmail(e.target.value)}
                    placeholder="Enter friend's email"
                    required
                  />
                  <button type="submit" className="submit-referral">
                    Send Referral
                  </button>
                </div>
              </form>
              
              <div className="referral-link-section">
                <p>Or share your referral link:</p>
                <div className="copy-link-container">
                  <input 
                    type="text" 
                    value="https://Cravezy.com/referral" 
                    readOnly 
                  />
                  <div className="link-actions">
                    <button 
                      className={`copy-link-btn ${copied ? 'copied' : ''}`}
                      onClick={copyReferralLink}
                    >
                      {copied ? <><CheckIcon /> Copied!</> : <><CopyIcon /> Copy</>}
                    </button>
                    <div className="share-container" ref={shareRef}>
                      <button 
                        className="share-link-btn"
                        onClick={shareReferralLink}
                      >
                        <ShareIcon /> Share
                      </button>
                      {showShareOptions && (
                        <div className="share-options">
                          <button className="share-option">Facebook</button>
                          <button className="share-option">Twitter</button>
                          <button className="share-option">WhatsApp</button>
                          <button className="share-option">Email</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="referral-history">
              <h3>Referral History</h3>
              {referralHistory.length > 0 ? (
                <div className="history-table">
                  <div className="table-header">
                    <div>Email</div>
                    <div>Date</div>
                    <div>Status</div>
                    <div>Points</div>
                  </div>
                  {referralHistory.map((referral) => (
                    <div className="table-row" key={referral.id}>
                      <div>{referral.email}</div>
                      <div>{referral.date}</div>
                      <div>
                        <span className={`status-badge ${referral.status}`}>
                          {referral.status}
                        </span>
                      </div>
                      <div>
                        {referral.status === 'successful' ? (
                          <span className="points-earned">+100 <CoinIcon /></span>
                        ) : (
                          <span className="pending">Pending</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-history">
                  <p>You haven't referred anyone yet. Start sharing to earn points!</p>
                </div>
              )}
            </div>
            
            <div className="referral-stats">
              <div className="stat-card">
                <div className="stat-value">{referralHistory.filter(r => r.status === 'successful').length}</div>
                <div className="stat-label">Successful Referrals</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">
                  {referralHistory.filter(r => r.status === 'successful').length * 100}
                </div>
                <div className="stat-label">Points Earned</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{referralHistory.length}</div>
                <div className="stat-label">Total Referrals</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReferralLoyalty;