import { useEffect } from 'react';

interface TitleProps {
  title: string;
  suffix?: string;
}

export function Title({ title, suffix = '| Nuwa AI Agent' }: TitleProps) {
  useEffect(() => {
    document.title = suffix ? `${title} ${suffix}` : title;
  }, [title, suffix]);

  return null;
}