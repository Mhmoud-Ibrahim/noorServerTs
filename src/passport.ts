import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../database/models/user.model.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "/api/v1/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
        // البحث عن المستخدم أو إنشاؤه إذا لم يكن موجوداً
        let user = await User.findOne({ email: profile.emails?.[0].value });
        if (!user) {
            user = await User.create({
                name: profile.displayName,
                email: profile.emails?.[0].value,
                password: Math.random().toString(36).slice(-8), // كلمة سر عشوائية
                googleId: profile.id
            });
        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
  }
));

// ضروري لعمل passport مع الـ sessions (أو مرره كبيانات فقط)
passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((user: any, done) => done(null, user));
