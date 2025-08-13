import React, { useState } from 'react';
import Slider from "react-slick";
import "./ReviewSlider.css";
import { FaStar } from 'react-icons/fa'; 
import { assets } from '../../assets/assets'; // adjust the relative path as needed

const reviews = [
  {
    name: "Galaxy Star",
    rating: 5,
    review: "The food was amazing! The spices were perfect, Galaxy Star eating the food in Galaxy! 🌌",
    image: assets.galaxystar,
  },
  {
    name: "Assault Ganesh",
    rating: 4,
    review: "Delicious meal and fast delivery, Ganesh was very impressed!",
    image: assets.Gangstar,
  },
  {
    name: "Irfan's view",
    rating: 4,
    review: "Delicious meal and fast delivery, would definitely order again!",
    image: assets.irfans,
  },
  {
    name: "Sivaji",
    rating: 1,
    review: "Ohh Shit! I was so disappointed! I had a great time but I was not satisfied with the food!",
    image: assets.Raj,
  },
  {
    name: "DisappointedMan",
    rating: 1,
    review: "Waited an hour for this... just for my taste buds to be betrayed. I’m standing here like, ‘This can’t be real.’ Absolute letdown. 😒🍽️",
    image: assets.shtit
  },
  {
    name: "Ishowspeed",
    rating: 5,
    review: "OMG!! THIS FOOD IS CRAZYYYY 😱🔥!! Bro, I took one bite and my mouth was like, BOOM 💥!! The spice? BANG BANG 🔥🔥!! Y’all gotta TRY this right NOW before I eat it all!! No cap, this is 5 stars, baby!! WOO WOO!! 🤯🍗",
    image: assets.ishow,
  },  
];

const ReviewSlider = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        }
      }
    ]
  };

  if (reviews.length === 0) return <div>No Reviews Available</div>;

  return (
    <div className={`review-slider ${isDarkMode ? 'dark' : ''}`}>
      <h2>User Reviews</h2>
      <button className="theme-toggle" onClick={toggleTheme}>
        {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </button>
      <Slider {...settings}>
        {reviews.map((review, index) => (
          <div key={index} className="review-card">
            <img src={review.image} alt={`${review.name}'s review`} className="review-image" />
            <h3>{review.name}</h3>
            <div className="rating">
              {Array.from({ length: 5 }, (_, i) => (
                <FaStar key={i} color={i < review.rating ? "#ffc107" : "#e4e5e9"} />
              ))}
            </div>
            <p>{review.review}</p>
            <button className="more-info-btn">More Info</button>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default ReviewSlider;
