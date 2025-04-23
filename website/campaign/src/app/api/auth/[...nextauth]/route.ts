import NextAuth from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";
import Airtable from 'airtable';

// 初始化Airtable客户端
const base = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY
}).base(process.env.AIRTABLE_BASE_ID || '');

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
async function createUserRecord(handle: string, name: string, avatar: string): Promise<boolean> {
    try {
        const table = base('Campaign Points');
        await table.create([
            {
                fields: {
                    Handle: handle,
                    Name: name,
                    Avatar: avatar,
                    Points: 0,
                    LastUpdated: new Date().toISOString()
                }
            }
        ]);
        console.log(`Successfully created user record for ${handle}`);
        return true;
    } catch (error) {
        console.error('Error creating user record:', error);
        return false;
    }
}

// 统一的用户记录管理函数
async function ensureUserRecord(handle: string, name: string, avatar: string): Promise<boolean> {
    try {
        const exists = await checkUserExists(handle);
        if (!exists) {
            console.log(`User record not found for ${handle}, creating new record...`);
            const created = await createUserRecord(handle, name, avatar);
            if (!created) {
                console.error(`Failed to create user record for ${handle}`);
                return false;
            }
        } else {
            console.log(`User record exists for ${handle}`);
        }
        return true;
    } catch (error) {
        console.error('Error in ensureUserRecord:', error);
        return false;
    }
}

// 更新用户信息
async function updateUserInfo(handle: string, name: string, avatar: string): Promise<boolean> {
    try {
        const table = base('Campaign Points');
        const records = await table.select({
            filterByFormula: `{Handle} = '${handle}'`,
            maxRecords: 1
        }).all();

        if (records.length > 0) {
            await records[0].updateFields({
                Name: name,
                Avatar: avatar,
                LastUpdated: new Date().toISOString()
            });
            console.log(`Successfully updated user info for ${handle}`);
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error updating user info:', error);
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

                // 确保用户记录存在
                const success = await ensureUserRecord(handle, name, avatar);
                if (!success) {
                    console.error(`Failed to ensure user record for ${handle} during sign in`);
                    // 可以选择返回false来阻止登录，或继续允许登录
                    // return false;
                }
            }
            return true;
        },
        async session({ session, token }) {
            if (session.user && token.twitterHandle) {
                session.user.twitterHandle = token.twitterHandle as string;

                // 确保用户记录存在并更新信息
                await ensureUserRecord(
                    token.twitterHandle as string,
                    session.user.name || '',
                    session.user.image || ''
                );

                // 更新用户信息
                await updateUserInfo(
                    token.twitterHandle as string,
                    session.user.name || '',
                    session.user.image || ''
                );
            }
            return session;
        },
        async jwt({ token, account, profile }) {
            if (account && profile) {
                const handle = (profile as any).data?.username;
                token.twitterHandle = handle;

                // 确保用户记录存在
                if (token.name && token.picture) {
                    await ensureUserRecord(
                        handle,
                        token.name as string,
                        token.picture as string
                    );
                }
            }
            return token;
        },
    },
    events: {
        async signIn({ user, account, profile }) {
            console.log(`User signed in: ${user.name} (${(profile as any).data?.username})`);
        },
        async signOut({ token }) {
            console.log(`User signed out: ${token.twitterHandle}`);
        },
    },
    debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST }; 