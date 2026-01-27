import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db/connect';
import { User } from '@/lib/db/models';
import { generateReferralCode } from '@/lib/utils/helpers';
import { loginSchema } from '@/lib/validators/auth';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            throw new Error('Invalid email or password');
          }

          await connectDB();

          // Find user with password field
          const user = await User.findOne({ email: parsed.data.email }).select('+passwordHash');

          if (!user) {
            throw new Error('Invalid email or password');
          }

          // Check if user has a password (might be Google-only account)
          if (!user.passwordHash) {
            throw new Error('Please sign in with Google');
          }

          // Check if user account is active
          if (user.status !== 'ACTIVE') {
            throw new Error('Your account has been suspended. Please contact support.');
          }

          // Verify password
          const isValidPassword = await bcrypt.compare(parsed.data.password, user.passwordHash);

          if (!isValidPassword) {
            throw new Error('Invalid email or password');
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error('Please verify your email before signing in');
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
            emailVerified: user.emailVerified,
            kycStatus: user.kycStatus,
            referralCode: user.referralCode,
            referralCount: user.referralCount,
          };
        } catch (error) {
          console.error('Auth error:', error);
          throw error;
        }
      },
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        try {
          await connectDB();

          const existingUser = await User.findOne({ email: user.email });

          if (!existingUser) {
            // Create new user from Google OAuth
            const newUser = new User({
              name: user.name,
              email: user.email,
              image: user.image,
              provider: 'google',
              emailVerified: new Date(),
              referralCode: generateReferralCode(),
            });

            await newUser.save();

            user.id = newUser._id.toString();
            user.role = newUser.role;
            user.kycStatus = newUser.kycStatus;
            user.referralCode = newUser.referralCode;
            user.referralCount = newUser.referralCount;
          } else {
            // Check if existing user is active
            if (existingUser.status !== 'ACTIVE') {
              console.error('Google sign-in rejected: User account is not active');
              return '/login?error=AccountSuspended';
            }

            // Update existing user if needed
            if (!existingUser.image && user.image) {
              existingUser.image = user.image;
              await existingUser.save();
            }

            user.id = existingUser._id.toString();
            user.role = existingUser.role;
            user.kycStatus = existingUser.kycStatus;
            user.referralCode = existingUser.referralCode;
            user.referralCount = existingUser.referralCount;
          }
        } catch (error) {
          console.error('Google sign-in error:', error);
          return '/login?error=OAuthError';
        }
      }

      return true;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.emailVerified = !!user.emailVerified;
        token.kycStatus = user.kycStatus;
        token.referralCode = user.referralCode || '';
        token.referralCount = user.referralCount || 0;
      }

      // Handle session updates (e.g., after KYC approval)
      if (trigger === 'update' && session) {
        if (session.kycStatus) token.kycStatus = session.kycStatus;
        if (session.role) token.role = session.role;
        if (session.referralCount !== undefined) token.referralCount = session.referralCount;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.emailVerified = token.emailVerified;
        session.user.kycStatus = token.kycStatus;
        session.user.referralCode = token.referralCode;
        session.user.referralCount = token.referralCount;
      }

      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 2 * 60 * 60, // 2 hours - short session for financial app security
  },
  secret: process.env.NEXTAUTH_SECRET,
};
