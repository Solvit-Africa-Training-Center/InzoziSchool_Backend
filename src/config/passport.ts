import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { User } from '../database/models/Users';
import { Role } from '../database/models/Roles';
import { AuthService } from '../services/authService';
import { config } from 'dotenv';
import { getRoleId } from '../utils/roleUtils';

config();

// Extend Express Request to include user
declare global {
  namespace Express {
    interface User {
      id: string;
      email: string;
      roleId: string;
      fullName: string;
      profileImage?: string | null;
    }
  }
}


// Serialize / Deserialize

passport.serializeUser((user: Express.User, done: (err: Error | null, id?: string) => void) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done: (err: Error | null, user?: Express.User | false) => void) => {
  try {
    const user = await User.findByPk(id);
    if (!user) return done(null, false);

    done(null, {
      id: user.id,
      email: user.email,
      roleId: user.roleId,
      fullName: user.fullName,
      profileImage: user.profileImage || null,
    });
  } catch (err) {
    done(err as Error, undefined);
  }
});


// Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      callbackURL: process.env.CALLBACK_URL || '/auth/google/callback',
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: Profile,
      done: VerifyCallback
    ) => {
      try {
        const email = profile.emails?.[0]?.value;
        const fullName = profile.displayName;
        const googleId = profile.id;
        const profileImage = profile.photos?.[0]?.value || null;

        if (!email) {
          return done(new Error('Email not available from Google'), undefined);
        }

        // ✅ Centralized role lookup (avoids raw findOne calls everywhere)
        const roleId = await getRoleId('NORMAL_USER');

        const { user } = await AuthService.loginWithGoogle({
          fullName,
          email,
          googleId,
          profileImage,
          roleId, // always UUID
        });

        // Attach user to request
        done(null, {
          id: user.id,
          email: user.email,
          roleId: user.roleId,
          fullName: user.fullName,
          profileImage: user.profileImage,
        } as Express.User);
      } catch (error) {
        done(error as Error, undefined);
      }
    }
  )
);

export default passport;
