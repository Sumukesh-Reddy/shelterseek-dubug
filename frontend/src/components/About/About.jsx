import React, { useEffect, useState } from 'react';
import { 
  FaBullseye, 
  FaEye, 
  FaLinkedin, 
  FaGithub, 
  FaEnvelope,
} from 'react-icons/fa';
import './About.css';

const About = () => {
  const [travelerCount, setTravelerCount] = useState(0);
  const [hostCount, setHostCount] = useState(0);

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/user-counts');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('User counts data:', data); // Debug log
        
        if (data.success) {
          animateCount(data.travelerCount, setTravelerCount);
          animateCount(data.hostCount, setHostCount);
        } else {
          console.warn('API returned success: false, using fallback numbers');
          setTravelerCount(10000);
          setHostCount(5000);
        }
      } catch (error) {
        console.error('Error fetching user counts:', error);
        // Use fallback numbers
        setTravelerCount(10000);
        setHostCount(5000);
      }
    };

    const animateCount = (targetNumber, setter) => {
      const duration = 2000;
      const frameRate = 30;
      const totalFrames = duration / (1000 / frameRate);
      const increment = targetNumber / totalFrames;
      let currentNumber = 0;
      
      const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= targetNumber) {
          clearInterval(timer);
          currentNumber = targetNumber;
        }
        setter(Math.round(currentNumber));
      }, 1000 / frameRate);
    };

    fetchUserCounts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="about-page">
      <header className="about-header">
        <h1>About ShelterSeek</h1>
        <p>Connecting travelers with unique accommodations and creating memorable experiences worldwide</p>
      </header>
      
      <div className="container">
        <section className="about-section">
          <h2>Our Story</h2>
          <p>
            ShelterSeek was founded in 2025 with a simple mission: to make travel accommodation more accessible, 
            affordable, and authentic. What began as a small project among travel enthusiasts has grown into 
            a trusted platform connecting thousands of travelers with unique places to stay around the world.
          </p>
          <p>
            We believe that where you stay should be more than just a place to sleep—it should be an integral 
            part of your travel experience. Our platform showcases everything from cozy apartments and 
            boutique hotels to unique stays like treehouses and houseboats, all carefully vetted to ensure 
            quality and authenticity.
          </p>
        </section>
        
        <div className="mission-vision">
          <div className="mission">
            <h3><FaBullseye /> Our Mission</h3>
            <p>
              To revolutionize the way people find accommodations by providing a platform that offers 
              transparency, diversity, and personalized options for every type of traveler, while 
              supporting local hosts and sustainable tourism practices.
            </p>
          </div>
          
          <div className="vision">
            <h3><FaEye /> Our Vision</h3>
            <p>
              We envision a world where travel accommodation is seamless, where every stay enhances 
              the journey, and where hosts and travelers form meaningful connections that transcend 
              traditional hospitality.
            </p>
          </div>
        </div>
        
        <section className="stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">{travelerCount.toLocaleString()}+</div>
              <div className="stat-label">Happy Travelers</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">{hostCount.toLocaleString()}+</div>
              <div className="stat-label">Verified Hosts</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1+</div>
              <div className="stat-label">Countries</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </div>
        </section>

        <section className="team-section">
          <h2>Meet Our Team</h2>
        
          <div className="team-members">
            <div className="team-member">
              <img src="/images/sumukesh1.jpg" alt="M. Sumukesh Reddy" />
              <h3>M. Sumukesh Reddy</h3>
              <p className="role">Traveller Experience Lead</p>
              <p className="bio">
                Travel enthusiast with a passion for creating seamless booking experiences. 
                Ensures our traveler interface is intuitive and feature-rich.
              </p>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/sumukesh-reddy-mopuram/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a href="https://github.com/Sumukesh-Reddy" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
                <a href="https://sumukesh-portfolio.vercel.app" target="_blank" rel="noopener noreferrer"><FaEnvelope /></a>
              </div>
            </div>
            
            <div className="team-member">
              <img src="/images/jhansi.jpg" alt="G. Jhansi" />
              <h3>G. Jhansi</h3>
              <p className="role">Host Relations Manager</p>
              <p className="bio">
                Hospitality expert who works closely with our hosts to maintain quality standards 
                and optimize their listings for maximum visibility.
              </p>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/jhansi-gudelli-094543315/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a href="https://github.com/jhansi-19" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
              </div>
            </div>

            <div className="team-member">
              <img src="/images/chinnu.jpg" alt="C. Prudhvi" />
              <h3>C. Prudhvi</h3>
              <p className="role">Administrative Systems</p>
              <p className="bio">
                Backend wizard who keeps our platform running smoothly and implements 
                new features to enhance functionality.
              </p>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/prudhvi-natha-reddy-67222a29b/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a href="https://github.com/prudhvi-natha-reddy" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
              </div>
            </div>

            <div className="team-member">
              <img src="/images/jash.jpg" alt="M. Jashwanth" />
              <h3>M. Jashwanth</h3>
              <p className="role">Administrative Systems</p>
              <p className="bio">
                Focuses on system security and data integrity to ensure our users' information 
                is always protected.
              </p>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/jaswanth-medisetti-830478318/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a href="https://github.com/Jaswanth-m25" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
              </div>
            </div>
            
            <div className="team-member">
              <img src="/images/sai.jpg" alt="A. Venkata Sai" />
              <h3>A. Venkata Sai</h3>
              <p className="role">User Data Specialist</p>
              <p className="bio">
                Manages user profiles and host details, ensuring accurate information 
                while maintaining strict privacy standards.
              </p>
              <div className="social-links">
                <a href="https://www.linkedin.com/in/venkata-sai-reddy-anipireddy-a73b742a3/" target="_blank" rel="noopener noreferrer"><FaLinkedin /></a>
                <a href="https://github.com/venkatasai0604" target="_blank" rel="noopener noreferrer"><FaGithub /></a>
              </div>
            </div>
          </div>
        </section>
        
        <section className="cta-section">
          <h2>Ready to Find Your Perfect Stay?</h2>
          <p>Join thousands of travelers discovering unique accommodations around the world</p>
          <a href="/" className="cta-button">Explore Listings</a>
        </section>
      </div>
    </div>
  );
};

export default About;