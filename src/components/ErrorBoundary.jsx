import React from 'react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(error) {
        return { error };
    }

    componentDidCatch(error, info) {
        console.error('[Sunflix]', error, info?.componentStack);
    }

    render() {
        if (this.state.error) {
            return (
                <div
                    style={{
                        minHeight: '100vh',
                        background: '#020617',
                        color: '#e2e8f0',
                        padding: '2rem',
                        fontFamily: 'system-ui, sans-serif',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        gap: '1rem',
                    }}
                >
                    <h1 style={{ fontSize: '1.25rem', color: '#22d3ee' }}>Sunflix hit a runtime error</h1>
                    <p style={{ maxWidth: 520, opacity: 0.85, lineHeight: 1.5 }}>
                        {this.state.error?.message || 'Unknown error'}
                    </p>
                    <button
                        type="button"
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '0.5rem',
                            padding: '0.6rem 1.2rem',
                            borderRadius: 8,
                            border: '1px solid rgba(34,211,238,0.5)',
                            background: 'rgba(34,211,238,0.15)',
                            color: '#e0f2fe',
                            cursor: 'pointer',
                        }}
                    >
                        Reload page
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}
