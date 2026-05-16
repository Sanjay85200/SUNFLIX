import { supabase, isSupabaseConfigured } from './supabase';

// Fetch all videos for a specific creator
export const getCreatorVideos = async (creatorId) => {
    if (!isSupabaseConfigured || !supabase) return [];
    try {
        const { data, error } = await supabase
            .from('creator_videos')
            .select('*')
            .eq('creator_id', creatorId)
            .order('created_at', { ascending: false });
        if (error) throw error;
        return data || [];
    } catch (err) {
        console.error('Error fetching creator videos:', err);
        return [];
    }
};

// Fetch aggregate stats for the dashboard
export const getCreatorStats = async (creatorId) => {
    if (!isSupabaseConfigured || !supabase) {
        return { totalViews: 0, totalLikes: 0, totalRevenue: 0 };
    }
    try {
        const { data, error } = await supabase
            .from('creator_videos')
            .select('views, likes, revenue_generated')
            .eq('creator_id', creatorId);
        
        if (error) throw error;
        
        let views = 0;
        let likes = 0;
        let revenue = 0;

        data.forEach(v => {
            views += v.views || 0;
            likes += v.likes || 0;
            revenue += parseFloat(v.revenue_generated || 0);
        });

        // Creator receives 30% of total generated revenue
        const creatorCut = revenue * 0.30;

        return { totalViews: views, totalLikes: likes, totalRevenue: creatorCut };
    } catch (err) {
        console.error('Error fetching creator stats:', err);
        return { totalViews: 0, totalLikes: 0, totalRevenue: 0 };
    }
};

// Helper to upload a file to Supabase Storage bucket 'creator_content'
export const uploadCreatorContent = async (creatorId, file, type) => {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
    
    // type is 'video' or 'thumbnail'
    const fileExt = file.name.split('.').pop();
    const fileName = `${creatorId}/${Date.now()}_${type}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
        .from('creator_content')
        .upload(fileName, file);

    if (uploadError) {
        throw uploadError;
    }

    const { data } = supabase.storage
        .from('creator_content')
        .getPublicUrl(fileName);

    return data.publicUrl;
};

// Create a new video record in the database
export const createVideoRecord = async (videoData) => {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
        .from('creator_videos')
        .insert([videoData]);
        
    if (error) throw error;
};

// Delete a video and its storage files (optional advanced logic could delete storage files too)
export const deleteVideoRecord = async (videoId) => {
    if (!isSupabaseConfigured || !supabase) throw new Error('Supabase not configured');
    
    const { error } = await supabase
        .from('creator_videos')
        .delete()
        .eq('id', videoId);
        
    if (error) throw error;
};
