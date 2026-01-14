import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
// import { prisma } from '@/lib/prisma'; // Uncomment when database is connected

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

                // TODO: Replace with Prisma query when database is connected
                // const user = await prisma.user.findUnique({
                //     where: { email: credentials.email }
                // });

                // Demo user check (remove when database is connected)
                let user = null;
                let isDemo = false;
                if (credentials.email === demoUser.email) {
                    user = demoUser;
                    isDemo = true;
                }

                if (!user) {
                    throw new Error('No user found with this email');
                }

                // For demo user, use direct comparison. For real users, use bcrypt
                const isPasswordValid = isDemo
                    ? credentials.password === 'admin123'
                    : await bcrypt.compare(credentials.password, user.password);

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
