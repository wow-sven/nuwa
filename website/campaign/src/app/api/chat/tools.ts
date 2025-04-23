import { tool } from 'ai';
import { z } from 'zod';
import { updateReward, checkUserRewardHistory, getUserPoints } from '@/app/services/airtable';

// 通用Twitter API调用函数
async function callTwitterApi(endpoint: string, params: Record<string, string> = {}) {
    const apiKey = process.env.TWITTER_API_KEY;

    if (!apiKey) {
        return {
            error: 'Twitter API key is not configured',
        };
    }

    try {
        // 构建URL，添加查询参数
        const queryString = Object.entries(params)
            .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
            .join('&');

        const url = `https://api.twitterapi.io/twitter/${endpoint}${queryString ? `?${queryString}` : ''}`;


        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'X-API-Key': apiKey,
            },
        });

        const data = await response.json();

        if (!response.ok || data.status === "error") {
            const errorText = await data.message;
            return {
                error: `Failed to fetch Twitter data: ${response.status} ${response.statusText}`,
                details: errorText
            };
        }
        return data;
    } catch (error) {
        return {
            error: `Error fetching Twitter data: ${error instanceof Error ? error.message : String(error)}`,
        };
    }
}

// 优化推文数据的工具函数
function optimizeTweetsData(tweets: any[], pinTweet?: any) {
    if (!tweets) return [];

    const optimizedTweets = tweets.map((tweet: {
        author: { userName: string };
        text: string;
        retweetCount: number;
        replyCount: number;
        likeCount: number;
        quoteCount: number;
        viewCount: number;
    }) => ({
        author: tweet.author.userName,
        text: tweet.text,
        retweetCount: tweet.retweetCount,
        replyCount: tweet.replyCount,
        likeCount: tweet.likeCount,
        quoteCount: tweet.quoteCount,
        viewCount: tweet.viewCount
    }));

    // 处理可能存在的 pin_tweet 对象
    if (pinTweet) {
        const pinTweetObj = {
            author: pinTweet.author.userName,
            text: pinTweet.text,
            retweetCount: pinTweet.retweetCount,
            replyCount: pinTweet.replyCount,
            likeCount: pinTweet.likeCount,
            quoteCount: pinTweet.quoteCount,
            viewCount: pinTweet.viewCount,
            isPinned: true // 添加标记表示这是置顶推文
        };
        optimizedTweets.unshift(pinTweetObj); // 将置顶推文添加到数组开头
    }

    return optimizedTweets;
}

export const tools = {

    // 1. 批量获取用户信息
    twitterBatchGetUsers: tool({
        description: 'Get information about multiple Twitter users by their user IDs',
        parameters: z.object({
            userIds: z.string().describe('Comma-separated list of Twitter user IDs'),
        }),
        execute: async ({ userIds }) => {
            return callTwitterApi('user/batch_info_by_ids', { userIds });
        },
    }),

    // 2. 通过用户名获取用户信息
    twitterGetUserByUsername: tool({
        description: 'Get information about a Twitter user by username',
        parameters: z.object({
            userName: z.string().describe('The Twitter username to get information for'),
        }),
        execute: async ({ userName }) => {
            return callTwitterApi('user/info', { userName });
        },
    }),

    // 3. 获取用户最新推文
    twitterGetUserLastTweets: tool({
        description: 'Retrieve tweets by user name.Sort by created_at. Results are paginated, with each page returning up to 20 tweets.This API will not return the tweets the user replied to. If you want to get the reply tweets, please use the advanced search API.',
        parameters: z.object({
            userName: z.string().describe('The Twitter username to get tweets from'),
            cursor: z.string().optional().describe('Pagination cursor for retrieving more tweets'),
        }),
        execute: async ({ userName, cursor = "" }) => {
            const response = await callTwitterApi('user/last_tweets', {
                userName: userName,
                cursor: cursor
            });

            const data = response.data;

            // 如果API调用出错，直接返回错误信息
            if (response.status === "error") {
                return response.msg;
            }

            // 使用优化推文数据的工具函数
            if (data.tweets) {
                const optimizedTweets = optimizeTweetsData(data.tweets, data.pin_tweet);

                return {
                    tweets: optimizedTweets,
                    next_cursor: response.next_cursor,
                    has_next_page: response.has_next_page
                };
            }

            return response;
        },
    }),

    // 4. 获取用户关注者
    twitterGetUserFollowers: tool({
        description: 'Get user followers in reverse chronological order (newest first). Returns exactly 200 followers per page, sorted by follow date. Most recent followers appear on the first page. Use cursor for pagination through the complete followers list.',
        parameters: z.object({
            userName: z.string().describe('The Twitter username to get followers for'),
            cursor: z.string().optional().describe('Pagination cursor for retrieving more followers'),
        }),
        execute: async ({ userName, cursor = "" }) => {
            return callTwitterApi('user/followers', {
                userName: userName,
                cursor: cursor
            });
        },
    }),

    // 5. 获取用户关注的人
    twitterGetUserFollowings: tool({
        description: 'Get user followings. Each page returns exactly 200 followings. Use cursor for pagination.',
        parameters: z.object({
            userName: z.string().describe('The Twitter username to get followings for'),
            cursor: z.string().optional().describe('Pagination cursor for retrieving more followings'),
        }),
        execute: async ({ userName, cursor = "" }) => {
            return callTwitterApi('user/followings', {
                userName: userName,
                cursor: cursor
            });
        },
    }),

    // 6. 获取用户提及
    twitterGetUserMentions: tool({
        description: 'get tweet mentions by user screen name.Each page returns exactly 20 mentions. Use cursor for pagination. Order by mention time desc',
        parameters: z.object({
            userName: z.string().describe('The user screen name to get mentions for'),
            sinceTime: z.number().optional().describe('On or after a specified unix timestamp in seconds'),
            untilTime: z.number().optional().describe('Before a specified unix timestamp in seconds'),
            cursor: z.string().optional().describe('The cursor to paginate through the results. First page is ""'),
        }),
        execute: async ({ userName, sinceTime, untilTime, cursor = "" }) => {
            const params: Record<string, string> = {
                userName
            };

            if (sinceTime) {
                params.sinceTime = sinceTime.toString();
            }

            if (untilTime) {
                params.untilTime = untilTime.toString();
            }

            if (cursor) {
                params.cursor = cursor;
            }

            return callTwitterApi('user/mentions', params);
        },
    }),

    // 7. 通过ID获取推文
    twitterGetTweetsByIds: tool({
        description: 'Get tweets by their IDs',
        parameters: z.object({
            tweet_ids: z.string().describe('Comma-separated list of tweet IDs'),
            current_user: z.string().optional().describe('The username of the current user to check tweet ownership (optional)'),
        }),
        execute: async ({ tweet_ids, current_user }) => {
            const response = await callTwitterApi('tweets', { tweet_ids });

            // 检查API调用是否返回错误
            if (response.error) {
                return response;
            }

            const optimizedTweets = optimizeTweetsData(response.tweets);

            // 只有当提供了 current_user 参数时才检查作者身份
            if (current_user && optimizedTweets && optimizedTweets.length > 0) {
                const firstTweet = optimizedTweets[0];

                if (firstTweet.author.toLowerCase() !== current_user.toLowerCase()) {
                    return {
                        error: 'Author does not match',
                        message: `The tweet is not authored by ${current_user}.`,
                        tweet: firstTweet
                    };
                }
            }

            return optimizedTweets[0];
        },
    }),

    // 8. 获取推文回复
    twitterGetTweetReplies: tool({
        description: 'get tweet replies by tweet id.Each page returns exactly 20 replies. Use cursor for pagination. Order by reply time desc',
        parameters: z.object({
            tweetId: z.string().describe('The tweet ID to get. Must be an original tweet (not a reply to another tweet) and should be the first tweet in a thread.'),
            sinceTime: z.number().optional().describe('On or after a specified unix timestamp in seconds'),
            untilTime: z.number().optional().describe('Before a specified unix timestamp in seconds'),
            cursor: z.string().optional().describe('The cursor to paginate through the results. First page is ""'),
        }),
        execute: async ({ tweetId, sinceTime, untilTime, cursor = "" }) => {
            const params: Record<string, string> = {
                tweetId,
            };

            if (sinceTime) {
                params.sinceTime = sinceTime.toString();
            }

            if (untilTime) {
                params.untilTime = untilTime.toString();
            }

            if (cursor) {
                params.cursor = cursor;
            }

            return callTwitterApi('tweet/replies', params);
        },
    }),

    // 9. 获取推文引用
    twitterGetTweetQuotes: tool({
        description: 'Get tweet quotes by tweet ID. Each page returns exactly 20 quotes. Use cursor for pagination. Order by quote time desc',
        parameters: z.object({
            tweetId: z.string().describe('The tweet ID to get. eg. 1846987139428634858'),
            sinceTime: z.number().optional().describe('On or after a specified unix timestamp in seconds'),
            untilTime: z.number().optional().describe('Before a specified unix timestamp in seconds'),
            includeReplies: z.boolean().optional().describe('Whether to include replies in the results. Default is True'),
            cursor: z.string().optional().describe('The cursor to paginate through the results. First page is ""'),
        }),
        execute: async ({ tweetId, sinceTime, untilTime, includeReplies = true, cursor = "" }) => {
            const params: Record<string, string> = {
                tweetId,
                includeReplies: includeReplies.toString()
            };

            if (sinceTime) {
                params.sinceTime = sinceTime.toString();
            }

            if (untilTime) {
                params.untilTime = untilTime.toString();
            }

            if (cursor) {
                params.cursor = cursor;
            }

            return callTwitterApi('tweet/quotes', params);
        },
    }),

    // 10. 获取推文转发者
    twitterGetTweetRetweeters: tool({
        description: 'get tweet retweeters by tweet id.Each page returns about 100 retweeters. Use cursor for pagination. Order by retweet time desc',
        parameters: z.object({
            tweetId: z.string().describe('The tweet ID to get. eg. 1846987139428634858'),
            cursor: z.string().optional().describe('The cursor to paginate through the results. First page is ""'),
        }),
        execute: async ({ tweetId, cursor = "" }) => {
            const params: Record<string, string> = {
                tweetId,
            };

            if (cursor) {
                params.cursor = cursor;
            }

            return callTwitterApi('tweet/retweeters', params);
        },
    }),

    // 11. 奖励用户代币
    rewardUserPoints: tool({
        description: 'Reward points to a user for completing a mission',
        parameters: z.object({
            userName: z.string().describe('The username of the reward receiver'),
            points: z.number().describe('The amount of points to be rewarded'),
            mission: z.string().describe('The mission that was completed'),
            missionDetails: z.string().optional().describe('Additional details about the completed mission'),
        }),
        execute: async ({ userName, points, mission, missionDetails }) => {
            try {
                const success = await updateReward({
                    userName,
                    points,
                    mission,
                    missionDetails
                });

                if (success) {
                    return {
                        success: true,
                        message: `Successfully rewarded ${points} points to user ${userName} for completing mission: ${mission}`
                    };
                } else {
                    return {
                        success: false,
                        message: `Failed to reward points to user ${userName}`
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    message: `Error rewarding points: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        },
    }),

    // 12. 检查用户是否已经从特定任务获得过奖励
    checkUserRewardHistory: tool({
        description: 'Check if a user has already received rewards for a specific mission',
        parameters: z.object({
            userName: z.string().describe('The username to check'),
            mission: z.string().describe('The mission to check'),
        }),
        execute: async ({ userName, mission }) => {
            try {
                const result = await checkUserRewardHistory(userName, mission);

                return {
                    hasReceivedReward: result.hasReceived,
                    missionDetails: result.missionDetails || '',
                    message: result.hasReceived
                        ? `User ${userName} has already received rewards for mission: ${mission}`
                        : `User ${userName} has not received rewards for mission: ${mission} yet`
                };
            } catch (error) {
                return {
                    hasReceivedReward: false,
                    message: `Error checking reward history: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        },
    }),

    // 13. 扣除用户积分
    deductUserPoints: tool({
        description: 'Deduct points from a user',
        parameters: z.object({
            userName: z.string().describe('The username of the user to deduct points from'),
            points: z.number().describe('The amount of points to be deducted (positive number)'),
            mission: z.string().describe('The mission that is deducting the points'),
            missionDetails: z.string().optional().describe('Additional details about why points are being deducted'),
        }),
        execute: async ({ userName, points, mission, missionDetails }) => {
            try {
                if (points <= 0) {
                    return {
                        success: false,
                        message: `Points to deduct must be a positive number`
                    };
                }

                const success = await updateReward({
                    userName,
                    points: -points, // 传递负值以扣除积分
                    mission: mission,
                    missionDetails
                });

                if (success) {
                    return {
                        success: true,
                        message: `Successfully deducted ${points} points from user ${userName} for reason: ${mission}`
                    };
                } else {
                    return {
                        success: false,
                        message: `Failed to deduct points from user ${userName}`
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    message: `Error deducting points: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        },
    }),

    // 14. 生成随机数
    generateRandomNumber: tool({
        description: 'Generate a random integer between 0 and 100',
        parameters: z.object({}),
        execute: async () => {
            try {
                // 生成0到100之间的随机整数
                const randomNumber = Math.floor(Math.random() * 101);

                return randomNumber;
            } catch (error) {
                return {
                    error: `Error generating random number: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        },
    }),

    // 15. 获取用户当前积分
    getUserCurrentPoints: tool({
        description: 'Get the current points of a user from the Campaign Points table',
        parameters: z.object({
            userName: z.string().describe('The username to get points for'),
        }),
        execute: async ({ userName }) => {
            try {
                const result = await getUserPoints(userName);

                if (!result.success) {
                    return {
                        error: result.error || 'Failed to get user points'
                    };
                }

                return result.points;
            } catch (error) {
                return {
                    error: `Error getting user points: ${error instanceof Error ? error.message : String(error)}`
                };
            }
        },
    }),

    // 16. 检查用户是否关注了NuwaDev
    checkUserFollowsNuwaDev: tool({
        description: 'Check if a user follows the NuwaDev Twitter account',
        parameters: z.object({
            userName: z.string().describe('The Twitter username to check if they follow NuwaDev'),
        }),
        execute: async ({ userName }) => {
            try {
                let cursor = "";
                let hasMorePages = true;

                // 遍历所有关注列表页
                while (hasMorePages) {
                    // 获取用户关注列表的当前页
                    const followingsResponse = await callTwitterApi('user/followings', {
                        userName: userName,
                        cursor: cursor
                    });

                    // 检查API调用是否返回错误
                    if (followingsResponse.error) {
                        console.log(followingsResponse)
                        return {
                            error: followingsResponse.error,
                            details: followingsResponse.details,
                            followsNuwaDev: false
                        };
                    }

                    // 检查关注列表中是否包含NuwaDev
                    const followings = followingsResponse.followings || [""];
                    const followsNuwaDev = followings.some((following: any) =>
                        following.screen_name.toLowerCase() === 'nuwadev'
                    );

                    // 如果找到NuwaDev，立即返回结果
                    if (followsNuwaDev) {
                        return {
                            followsNuwaDev: true,
                            message: `User ${userName} follows @NuwaDev`
                        };
                    }

                    // 获取下一页的cursor
                    cursor = followingsResponse.next_cursor || "";
                    hasMorePages = followingsResponse.has_next_page || false;
                }

                // 如果遍历完所有页面都没有找到NuwaDev
                return {
                    followsNuwaDev: false,
                    message: `User ${userName} does not follow @NuwaDev`
                };
            } catch (error) {
                return {
                    error: `Error checking if user follows NuwaDev: ${error instanceof Error ? error.message : String(error)}`,
                    followsNuwaDev: false
                };
            }
        },
    }),
}; 