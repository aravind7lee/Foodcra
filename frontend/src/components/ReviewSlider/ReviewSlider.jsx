import React, { useState, useEffect, useRef } from 'react';
import Slider from "react-slick";
import "./ReviewSlider.css";
import { FaStar, FaCheckCircle } from 'react-icons/fa';
import { assets } from '../../assets/assets';

const reviews = [
  {
    name: "Galaxy Star",
    rating: 5,
    review: "The food was amazing! The spices were perfect, Galaxy Star eating the food in Galaxy! 🌌",
    image: assets.galaxystar,
    verified: true,
    timestamp: "2 days ago",
    orderItems: ["Garlic Mushroom", "Creamy Pasta"],
    deliveryTime: "22 mins",
    location: "Universe",
    emojis: ["🌌", "✨", "⭐"]
  },
  {
    name: "Assault Ganesh",
    rating: 4,
    review: "Delicious meal and fast delivery, Ganesh was very impressed! ☺️🎀",
    image: assets.Gangstar,
    verified: true,
    timestamp: "1 day ago",
    orderItems: ["Tandoori Chicken", "Spicy Chicken Wings"],
    deliveryTime: "28 mins",
    location: "Mumbai, India",
    emojis: ["🎀", "🙏"]
  },
  {
    name: "Irfan's view",
    rating: 4,
    review: "Delicious meal and fast delivery, would definitely order again!",
    image: assets.irfans,
    verified: false,
    timestamp: "3 days ago",
    orderItems: ["Cheese Cake", "Chicken Sandwich"],
    deliveryTime: "35 mins",
    location: "Thailand",
    emojis: ["👍", "😋"]
  },
  {
    name: "Sivaji",
    rating: 1,
    review: "Ohh My God! I was so disappointed! I had a great time but I was not satisfied with the food!, ahhh vazhthukkal vazhthukkal 🥰",
    image: assets.Raj,
    verified: true,
    timestamp: "5 days ago",
    orderItems: ["Chicken Salad", "Vegan Cake"],
    deliveryTime: "45 mins",
    location: "Bangalore, India",
    emojis: ["😔", "👎"]
  },
  {
    name: "DisappointedMan",
    rating: 1,
    review: "Waited an hour for this... just for my taste buds to be betrayed. I'm standing here like, 'This can't be real.' Absolute letdown. 😒🍽️",
    image: assets.shtit,
    verified: true,
    timestamp: "1 week ago",
    orderItems: ["Rice Zucchini", "Mix Veg Pulao"],
    deliveryTime: "58 mins",
    location: "Kolkata, India",
    emojis: ["😒", "👎"]
  },  
  {
    name: "Ishowspeed",
    rating: 5,
    review: "OMG!! THIS FOOD IS CRAZYYYY 😱🔥!! Bro, I took one bite and my mouth was like, BOOM 💥!! The spice? BANG BANG 🔥🔥!! Y'all gotta TRY this right NOW before I eat it all!! No cap, this is 5 stars, baby!! WOO WOO!! 🤯🍗",
    image: assets.ishow,
    verified: false,
    timestamp: "Just now",
    orderItems: ["Ronaldo", "Ronaldo"],
    deliveryTime: "18 mins",
    location: "Ronaldo",
    emojis: ["🔥", "💥", "🤯"]
  },  
];

const ReviewSlider = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const sliderRef = useRef(null);
  
  const toggleTheme = () => setIsDarkMode(prev => !prev);
  
  // Calculate aggregate metrics
  const totalReviews = reviews.length;
  const averageRating = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
  const deliverySatisfaction = Math.round((reviews.filter(r => r.rating >= 4).length / totalReviews) * 100);

  // Auto-rotate with pause on hover
  useEffect(() => {
    let interval;
    if (!isHovering) {
      interval = setInterval(() => {
        sliderRef.current.slickNext();
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isHovering]);

  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: false,
    centerMode: true,
    centerPadding: "0",
    beforeChange: (_, next) => setCurrentSlide(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
          centerMode: false,
        }
      },
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "40px",
        }
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          centerMode: true,
          centerPadding: "20px",
        }
      }
    ]
  };

  const handleExpand = (index) => {
    setExpandedReview(expandedReview === index ? null : index);
  };

  return (
    <div 
      className={`review-slider ${isDarkMode ? 'dark' : ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="slider-header">
        <h2>User Reviews</h2>
        <div className="aggregate-metrics">
          <span>{averageRating.toFixed(1)}/5</span> • 
          <span> {deliverySatisfaction}% Delivery Satisfaction</span> • 
          <span> {totalReviews} Reviews</span>
        </div>
      </div>
      
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>

      <Slider 
        ref={sliderRef} 
        {...settings} 
        className="custom-slider"
      >
        {reviews.map((review, index) => (
          <div 
            key={index} 
            className={`review-card ${currentSlide === index ? 'active' : ''} ${review.rating === 5 ? 'five-star' : ''}`}
          >
            <div className="card-header">
              <img 
                src={review.image} 
                alt={`${review.name}'s review`} 
                className="review-image" 
                onMouseEnter={() => setIsHovering(true)}
              />
              <div>
                <h3>{review.name}</h3>
                <div className="verification">
                  {review.verified && (
                    <span className="verified-badge">
                      <FaCheckCircle className="check-icon" /> Verified Order
                    </span>
                  )}
                  <span className="timestamp">{review.timestamp}</span>
                </div>
              </div>
            </div>
            
            <div className="rating">
              {[...Array(5)].map((_, i) => (
                <FaStar 
                  key={i} 
                  className={`star ${i < review.rating ? 'filled' : ''}`} 
                />
              ))}
              {review.rating === 5 && <div className="pulse-effect"></div>}
            </div>
            
            <p className={`review-text ${expandedReview === index ? 'expanded' : ''}`}>
              {review.review}
            </p>
            
            <button 
              className="more-info-btn" 
              onClick={() => handleExpand(index)}
            >
              {expandedReview === index ? 'Less Info' : 'More Info'}
            </button>
            
            {expandedReview === index && (
              <div className="expanded-info">
                <p><strong>Ordered:</strong> {review.orderItems.join(', ')}</p>
                <p><strong>Delivery Time:</strong> {review.deliveryTime}</p>
                <p><strong>Location:</strong> {review.location}</p>
              </div>
            )}
            
            <div className="emoji-container">
              {review.emojis.map((emoji, i) => (
                <span 
                  key={i} 
                  className="floating-emoji"
                  style={{ 
                    left: `${15 + (i * 15)}%`,
                    animationDelay: `${i * 0.2}s`
                  }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ReviewSlider;