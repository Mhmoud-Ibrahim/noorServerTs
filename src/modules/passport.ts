import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { Profile } from 'passport-google-oauth20';
import { User } from '../../database/models/user.model.js';

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: "https://vercel.app" // يجب أن يكون رابط الـ Callback كاملاً وصحيحاً
  },
  async (_accessToken: string, _refreshToken: string, profile: Profile, done: (err: any, user?: any) => void) => {
    try {
    const userEmail = profile.emails?.[0]?.value;
      if (!userEmail) {
        return done(new Error("Email not found from Google"), false);
      }

      // البحث عن المستخدم
      let user = await User.findOne({ email: userEmail });

      if (!user) {
        // إنشاء مستخدم جديد إذا لم يكن موجوداً
        user = await User.create({
          name: profile.displayName,
          email: userEmail,
          // كلمة سر عشوائية لتخطي الـ Validation في الموديل
          password: 'google-auth-' + Math.random().toString(36).slice(-8), 
          role: 'user'
        });
      }
      
      return done(null, user);
    } catch (err) {
      return done(err, false);
    }
  }
));

// تأكد من عمل serialize و deserialize ليتمكن passport من نقل بيانات المستخدم للـ req.user
passport.serializeUser((user: any, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport;
