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

// Helper to upload a file to Cloudinary
export const uploadCreatorContent = async (creatorId, file, type) => {
    // Cloudinary configuration from environment variables
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration is missing in environment variables');
    }

    // Determine resource type based on file type
    const resourceType = type === 'video' ? 'video' : 'image';
    const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', `sunflix_creators/${creatorId}`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Cloudinary Upload Error:", errorData);
            throw new Error(errorData.error?.message || 'Failed to upload to Cloudinary');
        }

        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error("Upload exception:", error);
        throw error;
    }
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

// --- Advanced Upload Feature ---

// XHR-based upload to Cloudinary to support real-time progress and cancellation
export const uploadWithProgress = (creatorId, file, type, onProgress) => {
    return new Promise((resolve, reject) => {
        const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
        
        if (!cloudName || !uploadPreset) {
            reject(new Error('Cloudinary configuration is missing in environment variables'));
            return;
        }

        const resourceType = type === 'video' ? 'video' : 'image';
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        formData.append('folder', `sunflix_creators/${creatorId}`);

        const xhr = new XMLHttpRequest();
        xhr.open('POST', url, true);

        let startTime = Date.now();
        let lastLoaded = 0;

        xhr.upload.onprogress = (event) => {
            if (event.lengthComputable && onProgress) {
                const percentComplete = (event.loaded / event.total) * 100;
                
                // Calculate speed
                const now = Date.now();
                const timeDiff = (now - startTime) / 1000; // seconds
                if (timeDiff > 0) {
                    const bytesSinceLast = event.loaded - lastLoaded;
                    const speedBps = bytesSinceLast / timeDiff;
                    const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);
                    
                    const remainingBytes = event.total - event.loaded;
                    const etaSeconds = speedBps > 0 ? (remainingBytes / speedBps) : 0;
                    
                    onProgress(percentComplete, speedMbps, etaSeconds);
                    
                    startTime = now;
                    lastLoaded = event.loaded;
                }
            }
        };

        xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    resolve(response.secure_url);
                } catch (e) {
                    reject(new Error('Failed to parse Cloudinary response'));
                }
            } else {
                reject(new Error(`Cloudinary upload failed with status ${xhr.status}: ${xhr.responseText}`));
            }
        };

        xhr.onerror = () => reject(new Error('Network error during upload'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));

        xhr.send(formData);

        // We attach the abort method to the promise so the caller can cancel it
        resolve.abort = () => xhr.abort();
    });
};
