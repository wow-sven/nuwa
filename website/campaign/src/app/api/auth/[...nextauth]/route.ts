import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import Airtable from 'airtable';

// 初始化Airtable客户端
const base = new Airtable({
    apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

// 检查用户是否已存在于Airtable中
async function checkUserExists(handle: string): Promise<boolean> {
    try {
        const table = base('Campaign Points');
        const records = await table.select({
            filterByFormula: `{Handle} = '${handle}'`,
            maxRecords: 1
        }).all();
        return records.length > 0;
    } catch (error) {
        console.error('Error checking user existence:', error);
        return false;
    }
}

// 创建新用户记录
async function createUserRecord(handle: string, name: string, avatar: string) {
    try {
        const table = base('Campaign Points');
        await table.create([
            {
                fields: {
                    Handle: handle,
                    Name: name,
                    Avatar: avatar,
                    Points: 0
                }
            }
        ]);
        return true;
    } catch (error) {
        console.error('Error creating user record:', error);
        return false;
    }
}

const handler = NextAuth({
    providers: [
        TwitterProvider({
            clientId: process.env.TWITTER_CLIENT_ID || "",
            clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
            version: "2.0",
        }),
    ],
    callbacks: {
        async signIn({ user, account, profile }) {
            if (account && profile) {
                const handle = (profile as any).data?.username;
                const name = user.name || '';
                const avatar = user.image || '';

                // 检查用户是否已存在
                const exists = await checkUserExists(handle);
                if (!exists) {
                    // 创建新用户记录
                    await createUserRecord(handle, name, avatar);
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.twitterHandle = token.twitterHandle as string;
            }
            return session;
        },
        async jwt({ token, account, profile }) {
            if (account && profile) {
                token.twitterHandle = (profile as any).data?.username;
            }
            return token;
        },
    },
});

export { handler as GET, handler as POST }; 