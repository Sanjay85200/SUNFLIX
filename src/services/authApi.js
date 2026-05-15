import { supabase, isSupabaseConfigured } from './supabase';

const DEMO_EMAIL = 'demo@sunflix.app';
const DEMO_PASSWORD = 'demo';

function isDemoLogin(credentials) {
    const okCreds =
        credentials.email === DEMO_EMAIL && credentials.password === DEMO_PASSWORD;
    if (!okCreds) return false;
    if (import.meta.env.VITE_AUTH_DEMO === 'true') return true;
    /* Dev: demo works without .env when Supabase is not configured */
    if (
        import.meta.env.DEV &&
        import.meta.env.VITE_AUTH_DEMO !== 'false' &&
        !isSupabaseConfigured
    ) {
        return true;
    }
    return false;
}

const authApi = {
    login: async (credentials) => {
        if (isDemoLogin(credentials)) {
            return {
                data: {
                    user: {
                        id: 'sunflix-demo',
                        email: DEMO_EMAIL,
                        user_metadata: { name: 'Demo Pilot' },
                    },
                    token: 'sunflix-demo-session',
                },
            };
        }

        if (!isSupabaseConfigured || !supabase) {
            throw new Error(
                'Supabase is not configured. Copy .env.example to .env and add your keys, or set VITE_AUTH_DEMO=true and sign in with demo@sunflix.app / demo.'
            );
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
        });
        if (error) throw new Error(error.message);

        return {
            data: {
                user: data.user,
                token: data.session.access_token,
            },
        };
    },

    signup: async (formData) => {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error(
                'Supabase is not configured. Copy .env.example to .env and add your Supabase URL and anon key.'
            );
        }

        const { data, error } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    name: formData.name,
                    mobile: formData.mobile,
                },
            },
        });
        if (error) throw new Error(error.message);
        return data;
    },

    verifyOtp: async ({ email, otp }) => {
        if (!isSupabaseConfigured || !supabase) {
            throw new Error('Supabase is not configured.');
        }

        const { data, error } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'signup',
        });
        
        if (error) throw new Error(error.message);

        return {
            data: {
                user: data.user,
                token: data.session?.access_token,
            },
        };
    },
};

export default authApi;
