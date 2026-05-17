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

// --- Social Engagement Features ---

export const likeCreatorVideo = async (videoId) => {
    if (!isSupabaseConfigured || !supabase) return;
    
    // Simple rpc or fetch and increment. For safety without rpc, we fetch first.
    const { data: video, error: fetchError } = await supabase
        .from('creator_videos')
        .select('likes')
        .eq('id', videoId)
        .single();
        
    if (fetchError || !video) return;
    
    await supabase
        .from('creator_videos')
        .update({ likes: (video.likes || 0) + 1 })
        .eq('id', videoId);
};

export const getComments = async (videoId) => {
    if (!isSupabaseConfigured || !supabase) return [];
    
    const { data, error } = await supabase
        .from('video_comments')
        .select('*')
        .eq('video_id', videoId)
        .order('created_at', { ascending: true });
        
    if (error) {
        console.error("Error fetching comments:", error);
        return [];
    }
    return data;
};

export const addComment = async (videoId, userId, content, authorName = 'Anonymous') => {
    if (!isSupabaseConfigured || !supabase) throw new Error("Supabase not configured");
    
    const { data, error } = await supabase
        .from('video_comments')
        .insert([{ video_id: videoId, user_id: userId, content, author_name: authorName }])
        .select()
        .single();
        
    if (error) throw error;
    return data;
};

export const followCreator = async (creatorId, followerId) => {
    if (!isSupabaseConfigured || !supabase) throw new Error("Supabase not configured");
    
    const { error } = await supabase
        .from('creator_followers')
        .insert([{ creator_id: creatorId, follower_id: followerId }]);
        
    // Ignore duplicate key errors if they already follow
    if (error && error.code !== '23505') throw error;
};

export const checkIsFollowing = async (creatorId, followerId) => {
    if (!isSupabaseConfigured || !supabase) return false;
    
    const { count, error } = await supabase
        .from('creator_followers')
        .select('*', { count: 'exact', head: true })
        .eq('creator_id', creatorId)
        .eq('follower_id', followerId);
        
    if (error) return false;
    return count > 0;
};
