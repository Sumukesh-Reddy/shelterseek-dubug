import React from 'react';
import './Testimonials.css';

const Testimonials = () => {
  const testimonials = [
    {
      id: 1,
      quote: "ShelterSeek helped me find the perfect place for my vacation. Highly recommended!",
      author: "Zoro"
    },
    {
      id: 2,
      quote: "Amazing service and great accommodations. Will definitely use again!",
      author: "Luffy"
    },
    {
      id: 3,
      quote: "The best travel website I've ever used. Everything was perfect!",
      author: "Naruto"
    },
    {
      id: 4,
      quote: "Found exactly what I needed at a great price. 5-star experience!",
      author: "Goku"
    },
    {
      id: 5,
      quote: "User-friendly interface and excellent customer support.",
      author: "Vegeta"
    },
    {
      id: 6,
      quote: "Saved me hours of searching. Will recommend to all my friends!",
      author: "Ichigo"
    },
    {
      id: 7,
      quote: "The booking process was seamless and hassle-free.",
      author: "Light Yagami"
    },
    {
      id: 8,
      quote: "Great selection of properties in all price ranges.",
      author: "Eren Yeager"
    },
    {
      id: 9,
      quote: "Customer service went above and beyond to help me.",
      author: "Mikasa Ackerman"
    },
    {
      id: 10,
      quote: "Best travel platform I've encountered in years!",
      author: "Levi Ackerman"
    }
  ];

  return (
    <div className="testimonials-section">
      <h2>What Our Users Say</h2>
      <div className="marquee-container">
        <div className="marquee">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div key={`${testimonial.id}-${index}`} className="testimonial-card">
              <p className="quote">"{testimonial.quote}"</p>
              <p className="author">- {testimonial.author}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;