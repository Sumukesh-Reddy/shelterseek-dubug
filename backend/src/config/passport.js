const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const { Traveler, Host } = require('../models/User');
const { logAuthError } = require('../utils/logger');

module.exports = function(passport) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google profile:', profile.displayName, profile.emails?.[0]?.value);
          
          if (!profile.emails || !profile.emails[0]) {
            return done(new Error('No email provided by Google'), null);
          }
          
          const email = profile.emails[0].value;
          const name = profile.displayName;

          // Check for existing user by googleId or email
          let user = await Traveler.findOne({ 
            $or: [{ googleId: profile.id }, { email }]
          });

          if (!user) {
            user = await Host.findOne({ 
              $or: [{ googleId: profile.id }, { email }]
            });
          }

          if (!user) {
            // Create new traveler for Google login
            user = await Traveler.create({
              googleId: profile.id,
              name,
              email,
              accountType: 'traveller',
              isVerified: true,
              profilePhoto: profile.photos?.[0]?.value
            });
            console.log('✅ New Google user created:', user.email);
          } else {
            // Update googleId if not set
            if (!user.googleId) {
              user.googleId = profile.id;
              await user.save();
            }
            console.log('✅ Existing Google user found:', user.email);
          }

          return done(null, user);
        } catch (err) {
          logAuthError('Google Strategy error', {
            error: err.message,
            googleId: profile?.id
          });
          return done(err, null);
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, { 
      id: user.id, 
      type: user.accountType === 'host' ? 'Host' : 'Traveler' 
    });
  });

  passport.deserializeUser(async (data, done) => {
    try {
      let user;
      if (data.type === 'Host') {
        user = await Host.findById(data.id);
      } else {
        user = await Traveler.findById(data.id);
      }
      
      if (!user) {
        return done(new Error('User not found'), null);
      }
      
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};