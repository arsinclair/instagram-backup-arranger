interface ExifDatum {
    date_time_digitized?: string;
    date_time_original?: string;
    source_type?: string;
    latitude?: number;
    longitude?: number;
}

interface Metadata {
    exif_data: ExifDatum[];
    music_genre?: string;
}

interface CameraMetadata {
    has_camera_metadata: boolean;
}

interface MediaMetadata {
    video_metadata?: Metadata;
    camera_metadata: CameraMetadata;
    photo_metadata?: Metadata;
}

export type InstagramStory = {
    uri: string;
    creation_timestamp: number;
    media_metadata: MediaMetadata;
    title: string;
};

export type InstagramStories = {
    ig_stories: InstagramStory[];
};