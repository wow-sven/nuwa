'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function AuthSuccessPage() {
    const searchParams = useSearchParams();
    const telegramId = searchParams.get('telegram_id');
    const twitterHandle = searchParams.get('twitter_handle');

    useEffect(() => {
        // Send success message to Telegram
        if (telegramId && twitterHandle) {
            const sendMessage = async () => {
                try {
                    await fetch('/api/bot/send-message', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            telegramId,
                            message: `Binding successful! Your Telegram account has been successfully bound to Twitter account @${twitterHandle}.`
                        }),
                    });
                } catch (error) {
                    console.error('Failed to send message to Telegram:', error);
                }
            };

            sendMessage();
        }

        // Close window after 5 seconds
        const timer = setTimeout(() => {
            window.close();
        }, 5000);

        return () => clearTimeout(timer);
    }, [telegramId, twitterHandle]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-lg shadow-md max-w-md w-full text-center">
                <div className="mb-6">
                    <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Binding successful!</h1>
                <p className="text-gray-600 mb-6">
                    Your Telegram account has been successfully bound to Twitter account @{twitterHandle || 'unknown'}.
                    <br />
                    You can close this window and return to Telegram to continue using.
                </p>
                <p className="text-sm text-gray-500">
                    This window will close automatically in 5 seconds...
                </p>
            </div>
        </div>
    );
}
