import React from 'react';
import ReactMarkdown from 'react-markdown';

interface DocContentProps {
    content: string;
}

export const DocContent: React.FC<DocContentProps> = ({ content }) => {
    return (
        <div className="max-w-3xl mx-auto px-6 py-12 bg-white dark:bg-gray-900">
            <div className="prose prose-slate dark:prose-invert max-w-none
                prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-4xl prose-h1:mb-10 prose-h1:border-b prose-h1:border-gray-200 dark:prose-h1:border-gray-700 prose-h1:pb-4
                prose-h2:text-3xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:text-gray-900 dark:prose-h2:text-gray-100
                prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-gray-800 dark:prose-h3:text-gray-200
                prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed prose-p:text-lg
                prose-a:text-purple-600 dark:prose-a:text-purple-400 prose-a:no-underline hover:prose-a:underline
                prose-code:text-purple-600 dark:prose-code:text-purple-400 prose-code:bg-gray-100 dark:prose-code:bg-gray-800
                prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md prose-code:text-sm
                prose-pre:bg-gray-50 dark:prose-pre:bg-gray-800 prose-pre:rounded-xl prose-pre:p-6
                prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700
                prose-pre:shadow-sm dark:prose-pre:shadow-none
                prose-pre:overflow-x-auto
                prose-strong:text-gray-900 dark:prose-strong:text-gray-100 prose-strong:font-semibold
                prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-2
                prose-li:text-gray-600 dark:prose-li:text-gray-300 prose-li:leading-relaxed
                prose-blockquote:border-l-4 prose-blockquote:border-purple-500
                prose-blockquote:pl-6 prose-blockquote:italic
                prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-300
                prose-blockquote:bg-gray-50 dark:prose-blockquote:bg-gray-800
                prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg
                prose-hr:border-gray-200 dark:prose-hr:border-gray-700 prose-hr:my-12
                prose-table:border-collapse prose-table:w-full
                prose-th:border prose-th:border-gray-200 dark:prose-th:border-gray-700
                prose-th:bg-gray-50 dark:prose-th:bg-gray-800
                prose-th:px-4 prose-th:py-2
                prose-td:border prose-td:border-gray-200 dark:prose-td:border-gray-700
                prose-td:px-4 prose-td:py-2
                prose-img:rounded-lg prose-img:shadow-md prose-img:mx-auto
                prose-figure:my-8">
                <ReactMarkdown>{content}</ReactMarkdown>
            </div>
        </div>
    );
}; 