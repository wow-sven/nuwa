import React from 'react';
import { useParams } from 'react-router-dom';
import { DocContent } from '../../components/docs/DocContent';
import { DocSidebar } from '../../components/docs/DocSidebar';

export const DocPage: React.FC = () => {
    const { docId } = useParams<{ docId: string }>();
    const [content, setContent] = React.useState<string>('');

    React.useEffect(() => {
        // Load from public/docs directory
        fetch(`/docs/${docId}.md`)
            .then((response) => response.text())
            .then((text) => setContent(text))
            .catch((error) => console.error('Error loading document:', error));
    }, [docId]);

    return (
        <div className="flex h-screen dark:bg-gray-900">
            <DocSidebar />
            <main className="flex-1 overflow-y-auto">
                <DocContent content={content} />
            </main>
        </div>
    );
}; 