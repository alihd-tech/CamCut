import { useEffect } from 'react';

interface JSONLDProps {
  type: string;
  data: Record<string, any>;
}

export default function JSONLD({ type, data }: JSONLDProps) {
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': type,
      ...data,
    });

    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [type, data]);

  return null;
}