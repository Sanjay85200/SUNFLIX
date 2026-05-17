import React, { createContext, useContext, useState, useCallback } from 'react';
import { uploadWithProgress, createVideoRecord } from '../services/creatorApi';
import { useAuth } from './AuthContext';

const UploadContext = createContext();

export const useUpload = () => useContext(UploadContext);

export const UploadProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeUploads, setActiveUploads] = useState({});

    const startUpload = useCallback(async (uploadParams) => {
        if (!user || user.id === 'sunflix-demo') return;

        const uploadId = `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const { title, description, category, videoFile, thumbnailFile } = uploadParams;

        setActiveUploads(prev => ({
            ...prev,
            [uploadId]: {
                id: uploadId,
                title,
                status: 'uploading_video',
                progress: 0,
                speed: 0,
                eta: 0,
                videoPromise: null,
                thumbnailPromise: null
            }
        }));

        try {
            // Upload Video with XHR Progress
            const videoPromise = uploadWithProgress(user.id, videoFile, 'video', (progress, speed, eta) => {
                setActiveUploads(prev => {
                    if (!prev[uploadId]) return prev; // cancelled
                    return {
                        ...prev,
                        [uploadId]: { ...prev[uploadId], progress, speed, eta }
                    };
                });
            });

            // Store promise so we can abort it
            setActiveUploads(prev => {
                if (!prev[uploadId]) return prev;
                return { ...prev, [uploadId]: { ...prev[uploadId], videoPromise } };
            });

            const videoUrl = await videoPromise;

            // Upload Thumbnail (no progress tracking needed for small images)
            setActiveUploads(prev => {
                if (!prev[uploadId]) return prev;
                return { ...prev, [uploadId]: { ...prev[uploadId], status: 'uploading_thumbnail', progress: 100 } };
            });

            let thumbnailUrl = 'https://image.tmdb.org/t/p/w500/hZ8KnS3S7uYySkvfx79v98pS1v.jpg';
            if (thumbnailFile) {
                const thumbnailPromise = uploadWithProgress(user.id, thumbnailFile, 'image', () => {});
                setActiveUploads(prev => {
                    if (!prev[uploadId]) return prev;
                    return { ...prev, [uploadId]: { ...prev[uploadId], thumbnailPromise } };
                });
                thumbnailUrl = await thumbnailPromise;
            }

            // Create DB Record
            setActiveUploads(prev => {
                if (!prev[uploadId]) return prev;
                return { ...prev, [uploadId]: { ...prev[uploadId], status: 'processing' } };
            });

            await createVideoRecord({
                creator_id: user.id,
                title,
                description,
                category,
                video_url: videoUrl,
                thumbnail_url: thumbnailUrl,
                views: 0,
                likes: 0,
                revenue_generated: 0
            });

            // Mark completed
            setActiveUploads(prev => {
                if (!prev[uploadId]) return prev;
                return { ...prev, [uploadId]: { ...prev[uploadId], status: 'completed' } };
            });

            // Auto-remove completed upload after 5 seconds
            setTimeout(() => {
                setActiveUploads(prev => {
                    const newUploads = { ...prev };
                    delete newUploads[uploadId];
                    return newUploads;
                });
            }, 5000);

        } catch (error) {
            console.error("Background Upload Error:", error);
            if (error.message === 'Upload cancelled') {
                setActiveUploads(prev => {
                    const newUploads = { ...prev };
                    delete newUploads[uploadId];
                    return newUploads;
                });
            } else {
                setActiveUploads(prev => {
                    if (!prev[uploadId]) return prev;
                    return { ...prev, [uploadId]: { ...prev[uploadId], status: 'error', error: error.message } };
                });
                // Auto-remove error after 10 seconds
                setTimeout(() => {
                    setActiveUploads(prev => {
                        const newUploads = { ...prev };
                        delete newUploads[uploadId];
                        return newUploads;
                    });
                }, 10000);
            }
        }
    }, [user]);

    const cancelUpload = useCallback((uploadId) => {
        setActiveUploads(prev => {
            const upload = prev[uploadId];
            if (upload) {
                if (upload.videoPromise && upload.videoPromise.abort) upload.videoPromise.abort();
                if (upload.thumbnailPromise && upload.thumbnailPromise.abort) upload.thumbnailPromise.abort();
            }
            const newUploads = { ...prev };
            delete newUploads[uploadId];
            return newUploads;
        });
    }, []);

    return (
        <UploadContext.Provider value={{ activeUploads, startUpload, cancelUpload }}>
            {children}
        </UploadContext.Provider>
    );
};
