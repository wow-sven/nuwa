'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function SuccessContent() {
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
                            message: `Successfully bound with Twitter account @${twitterHandle}!`
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
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Binding Successful</h1>
                <p className="text-gray-600 mb-6">
                    Your Twitter account @{twitterHandle} has been successfully bound!
                    <br />
                    Please return to Telegram to continue.
                </p>
                <p className="text-sm text-gray-500">
                    This window will close automatically in 5 seconds...
                </p>
            </div>
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
