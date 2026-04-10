import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../../database/models/user.model.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "https://vercel.app" // رابط الباك إند
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const userEmail = profile.emails?.[0]?.value;
      if (!userEmail) return done(new Error("Email not found"), false);

      let user = await User.findOne({ email: userEmail });
      if (!user) {
        user = await User.create({
          name: profile.displayName,
          email: userEmail,
          password: 'google-auth-no-password-' + Math.random(), 
          role: 'user'
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

export default passport;
