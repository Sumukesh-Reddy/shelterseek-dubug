import React, { useState } from 'react';
import Testimonials from '../Testimonials/Testimonials';
import './travelerContent.css';

const TravelContent = () => {
  const [activeModal, setActiveModal] = useState(null);

  const openModal = (modalId) => {
    setActiveModal(modalId);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const renderModal = () => {
    switch(activeModal) {
      case 'chennai':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <img src="/images/photo4.jpg" alt="Chennai" />
            </div>
            <div className="modal-body">
              <h2>Chennai</h2>
              <p>Chennai, the capital of Tamil Nadu, is a vibrant city known for its rich cultural heritage, historic temples, and beautiful beaches. It is a hub of art, music, and dance, offering a perfect blend of tradition and modernity.</p>
              <h3>Highlights</h3>
              <ul>
                <li>Rich cultural heritage</li>
                <li>Historic temples and architecture</li>
                <li>Pristine beaches</li>
                <li>Delicious South Indian cuisine</li>
              </ul>
              <h3>Must-Visit Attractions</h3>
              <ul>
                <li>Marina Beach</li>
                <li>Kapaleeshwarar Temple</li>
                <li>Fort St. George</li>
                <li>Government Museum</li>
              </ul>
            </div>
          </div>
        );
      case 'goa':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <img src="/images/photo3.jpg" alt="Goa" />
            </div>
            <div className="modal-body">
              <h2>Goa</h2>
              <p>Goa, India's smallest state, is famous for its stunning beaches, vibrant nightlife, and Portuguese-influenced architecture. It is a perfect destination for relaxation, adventure, and cultural exploration.</p>
              <h3>Highlights</h3>
              <ul>
                <li>Pristine beaches</li>
                <li>Vibrant nightlife</li>
                <li>Portuguese heritage</li>
                <li>Water sports and adventure activities</li>
              </ul>
              <h3>Must-Visit Attractions</h3>
              <ul>
                <li>Calangute Beach</li>
                <li>Basilica of Bom Jesus</li>
                <li>Fort Aguada</li>
                <li>Anjuna Flea Market</li>
              </ul>
            </div>
          </div>
        );
      case 'tirupati':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <img src="/images/photo1.jpg" alt="Tirupati" />
            </div>
            <div className="modal-body">
              <h2>Tirupati</h2>
              <p>Tirupati, located in the state of Andhra Pradesh, is one of the most important pilgrimage destinations in India. It is home to the sacred Venkateswara Temple and offers a serene and spiritual experience.</p>
              <h3>Highlights</h3>
              <ul>
                <li>Spiritual significance</li>
                <li>Scenic hills and natural beauty</li>
                <li>Rich cultural heritage</li>
                <li>Peaceful and serene environment</li>
              </ul>
              <h3>Must-Visit Attractions</h3>
              <ul>
                <li>Sri Venkateswara Temple</li>
                <li>Silathoranam (Natural Arch)</li>
                <li>Akasa Ganga</li>
                <li>Kapila Theertham</li>
              </ul>
            </div>
          </div>
        );
      case 'travel-tips':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <img src="/images/photo3.jpg" alt="Travel Tips" />
            </div>
            <div className="modal-body">
              <h2>Top 10 Travel Tips</h2>
              <p>1. Plan ahead and book flights and accommodations early to save money.</p>
              <p>2. Pack light and only bring essentials to avoid extra baggage fees.</p>
              <p>3. Research local customs and etiquette to respect the culture.</p>
              <p>4. Stay hydrated and carry a reusable water bottle.</p>
              <p>5. Use travel apps for navigation, translation, and recommendations.</p>
              <p>6. Keep important documents and valuables secure.</p>
              <p>7. Learn a few basic phrases in the local language.</p>
              <p>8. Be flexible and open to unexpected experiences.</p>
              <p>9. Take photos but also enjoy the moment without your phone.</p>
              <p>10. Travel insurance is a must for peace of mind.</p>
            </div>
          </div>
        );
      case 'destinations-2025':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <img src="/images/photo1.jpg" alt="Destinations 2025" />
            </div>
            <div className="modal-body">
              <h2>Best Destinations for 2025</h2>
              <p>1. Paris, France - The City of Light continues to enchant visitors.</p>
              <p>2. Tokyo, Japan - A blend of tradition and modernity.</p>
              <p>3. New York City, USA - The city that never sleeps.</p>
              <p>4. Bali, Indonesia - Tropical paradise with stunning beaches.</p>
              <p>5. Cape Town, South Africa - Breathtaking landscapes and wildlife.</p>
              <p>6. Rome, Italy - Ancient history and delicious cuisine.</p>
              <p>7. Sydney, Australia - Iconic landmarks and vibrant culture.</p>
              <p>8. Dubai, UAE - Futuristic architecture and luxury experiences.</p>
              <p>9. Kyoto, Japan - Serene temples and traditional tea houses.</p>
              <p>10. Reykjavik, Iceland - Northern lights and geothermal wonders.</p>
            </div>
          </div>
        );
      case 'budget-travel':
        return (
          <div className="modal-content">
            <div className="modal-header">
              <img src="/images/photo2.jpg" alt="Budget Travel" />
            </div>
            <div className="modal-body">
              <h2>How to Travel on a Budget</h2>
              <p>1. Use budget airlines and book flights during off-peak seasons.</p>
              <p>2. Stay in hostels, guesthouses, or use platforms like Airbnb.</p>
              <p>3. Cook your own meals instead of eating out every day.</p>
              <p>4. Use public transportation instead of taxis.</p>
              <p>5. Look for free or discounted attractions and activities.</p>
              <p>6. Travel with a group to split costs.</p>
              <p>7. Use travel reward points and loyalty programs.</p>
              <p>8. Avoid tourist traps and explore local neighborhoods.</p>
              <p>9. Pack light to avoid extra baggage fees.</p>
              <p>10. Plan and budget your trip in advance.</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="travel-content">
      {/* Featured Destinations Section */}
      <div className="featured-destinations">
        <h2>Featured Destinations</h2>
        <div className="destination-grid">
          <div className="destination-card">
            <img src="/images/photo4.jpg" alt="Destination 1" />
            <h3>Chennai</h3>
            <p>Explore the bustling streets of Chennai, known for its rich culture, historic temples, and vibrant beaches.</p>
            <button className="btn" onClick={() => openModal('chennai')}>Learn More</button>
          </div>
          <div className="destination-card">
            <img src="/images/photo3.jpg" alt="Destination 2" />
            <h3>Goa</h3>
            <p>Discover the romantic charm of Goa with its pristine beaches, lively nightlife, and Portuguese heritage.</p>
            <button className="btn" onClick={() => openModal('goa')}>Learn More</button>
          </div>
          <div className="destination-card">
            <img src="/images/photo1.jpg" alt="Destination 3" />
            <h3>Tirupati</h3>
            <p>Experience the spiritual aura of Tirupati, home to the famous Venkateswara Temple and scenic hills.</p>
            <button className="btn" onClick={() => openModal('tirupati')}>Learn More</button>
          </div>
        </div>
      </div>

    <Testimonials/>
      {/* Blog Section */}
      <div className="blog">
        <h2>Latest Blog Posts</h2>
        <div className="blog-grid">
          <div className="blog-card">
            <img src="/images/photo3.jpg" alt="Blog 1" />
            <h3>Top 10 Travel Tips</h3>
            <p>Discover the best tips for a stress-free travel experience.</p>
            <button className="btn" onClick={() => openModal('travel-tips')}>Read More</button>
          </div>
          <div className="blog-card">
            <img src="/images/photo1.jpg" alt="Blog 2" />
            <h3>Best Destinations for 2025</h3>
            <p>Find out the top destinations to visit in 2025.</p>
            <button className="btn" onClick={() => openModal('destinations-2025')}>Read More</button>
          </div>
          <div className="blog-card">
            <img src="/images/photo2.jpg" alt="Blog 3" />
            <h3>How to Travel on a Budget</h3>
            <p>Learn how to travel without breaking the bank.</p>
            <button className="btn" onClick={() => openModal('budget-travel')}>Read More</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {activeModal && (
        <div className="modal active" onClick={closeModal}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            {renderModal()}
            <button className="modal-close" onClick={closeModal}>
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TravelContent;