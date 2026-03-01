import React from 'react';
import './PrivacyPolicy.css'; // We'll create this CSS file next

const PrivacyPolicy = () => {
  return (
    <div className="privacy-policy-container">
      <div className="privacy-policy-content">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>Introduction</h2>
          <p>Welcome to ShelterSeek. We are committed to protecting your privacy and ensuring that your personal information is handled securely and responsibly. This Privacy Policy explains how we collect, use, and safeguard your information when you use our services.</p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>We may collect the following types of information:</p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email, phone number when you register or book.</li>
            <li><strong>Payment Information:</strong> Card details for transactions (processed securely via Stripe/PayPal).</li>
            <li><strong>Usage Data:</strong> IP address, browser type, pages visited.</li>
            <li><strong>Location Data:</strong> Only if you enable location services.</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <ul>
            <li>To provide and improve our services</li>
            <li>To process transactions</li>
            <li>To communicate with you</li>
            <li>For analytics and service optimization</li>
            <li>To comply with legal requirements</li>
          </ul>
        </section>

        <section>
          <h2>Data Sharing</h2>
          <p>We <strong>do not sell</strong> your data. We may share information with:</p>
          <ul>
            <li>Payment processors (Stripe, PayPal)</li>
            <li>Cloud service providers (AWS, Firebase)</li>
            <li>When required by law</li>
          </ul>
        </section>

        <section>
          <h2>Your Rights</h2>
          <p>You can:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request corrections</li>
            <li>Request deletion</li>
            <li>Opt-out of marketing</li>
            <li>Withdraw consent</li>
          </ul>
        </section>

        <section>
          <h2>Cookies</h2>
          <p>We use cookies for essential functionality and analytics. You can manage cookies in your browser settings.</p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>We may update this policy. Significant changes will be notified via email or website notice.</p>
        </section>

        <section className="contact-section">
          <h2>Contact Us</h2>
          <p>For privacy concerns:</p>
          <div className="contact-info">
            <p><strong>Email:</strong> privacy@shelterseek.com</p>
            <p><strong>Address:</strong> G04 IIIT Sri City, Chittor, AP 517646, India</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;