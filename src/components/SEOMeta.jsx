import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const routeSeoMap = {
    '/': {
        title: 'Sunflix - Futuristic AI Entertainment Platform',
        description: 'Explore trending movies, AI-curated picks, and immerse yourself in the neural streaming universe with a modern cyberpunk interface.'
    },
    '/anime': {
        title: 'Sunflix Anime Universe - Watch Anime Online',
        description: 'Dive into the ultimate Anime Universe on Sunflix. Watch popular, trending, and highly-rated Japanese anime with Ultra-HD streaming.'
    },
    '/profile': {
        title: 'Command Deck - Sunflix Profile',
        description: 'Manage your Sunflix watchlist, view statistics, and configure your neural streaming profile settings.'
    },
    '/rewards': {
        title: 'Missions & Loot - Sunflix Rewards',
        description: 'Complete missions, earn credits, and unlock premium features in the Sunflix Rewards center.'
    },
    '/watch-party': {
        title: 'Sync Rooms - Sunflix Watch Party',
        description: 'Host or join a watch party on Sunflix. Stream movies and anime simultaneously with friends in real-time.'
    }
};

export default function SEOMeta() {
    const location = useLocation();

    useEffect(() => {
        const seoData = routeSeoMap[location.pathname] || {
            title: 'Sunflix - Neural Streaming Universe',
            description: 'Sunflix is a futuristic AI-powered entertainment platform.'
        };

        // Update document title
        document.title = seoData.title;

        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (metaDescription) {
            metaDescription.setAttribute('content', seoData.description);
        } else {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            metaDescription.content = seoData.description;
            document.head.appendChild(metaDescription);
        }

        // Update OG title
        let ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.setAttribute('content', seoData.title);
        }

        // Update OG description
        let ogDescription = document.querySelector('meta[property="og:description"]');
        if (ogDescription) {
            ogDescription.setAttribute('content', seoData.description);
        }

    }, [location.pathname]);

    return null; // This component does not render anything visually
}
