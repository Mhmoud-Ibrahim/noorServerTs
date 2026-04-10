import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { User } from '../../database/models/user.model.js';


passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // الرابط الذي سيعود إليه جوجل بعد نجاح الدخول
    callbackURL: "https://noor-store-five.vercel.app" 
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      // الوصول للإيميل بشكل آمن
      const userEmail = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;

      if (!userEmail) {
        return done(new Error("No email found from Google account"), false);
      }

      // البحث عن المستخدم في الكلاستر الجديد
      let user = await User.findOne({ email: userEmail });

      if (!user) {
        // إنشاء مستخدم جديد إذا لم يكن موجوداً
        user = await User.create({
          name: profile.displayName,
          email: userEmail,
          password: 'google-auth-no-password', // كلمة مرور وهمية (تأكد أن الموديل يسمح بذلك)
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
