import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Profile } from 'passport-google-oauth20';
import { User } from '../database/models/user.model.js';

passport.use(new GoogleStrategy({
    clientID: process.env.clientID!,
    clientSecret: process.env.clientSecret!,
    callbackURL: "/api/v1/auth/google/callback"
  },
  async (_accessToken: string, _refreshToken: string, profile: Profile, done: (err: any, user?: any) => void) => {
    try {
        
        const userEmail = profile.emails?.[0]?.value;
        if (!userEmail) {
            return done(new Error("No email found from Google"), undefined);
        }

        let user = await User.findOne({ email: userEmail });
        
        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email: userEmail,
                password: Math.random().toString(36).slice(-8), 
                googleId: profile.id
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, undefined);
    }
  }
));
