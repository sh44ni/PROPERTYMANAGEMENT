import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAppConfig } from '@/lib/server/appConfig';

// Demo user for testing (remove when database is connected)
const demoUser = {
    id: 'demo-user-1',
    name: 'Admin User',
    email: 'admin@telal.om',
    password: '$2b$10$1MeFLc8Cpz5TPmzjxLbqRmo7GSPOXDaAj5WrYBsx', // password: admin123
    role: 'admin',
    image: null,
};

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter email and password');
                }

                const cfg = await getAppConfig();

                // Demo mode: allow demo credentials.
                if (cfg.mode !== 'live') {
                    if (credentials.email !== demoUser.email) {
                        throw new Error('No user found with this email');
                    }
                    if (credentials.password !== 'admin123') {
                        throw new Error('Invalid password');
                    }
                    return {
                        id: demoUser.id,
                        name: demoUser.name,
                        email: demoUser.email,
                        role: demoUser.role,
                        image: demoUser.image,
                    };
                }

                // Live mode: authenticate using database users only.
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email.toLowerCase().trim() },
                });

                if (!user) {
                    throw new Error('No user found with this email');
                }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    image: user.image,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
        error: '/login',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as typeof demoUser).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as typeof demoUser).id = token.id as string;
                (session.user as typeof demoUser).role = token.role as string;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET || 'telal-super-secret-key-change-in-production',
};
