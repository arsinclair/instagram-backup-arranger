interface Media {
    uri: string;
    creation_timestamp: number;
    media_metadata: MediaMetadata;
    title: string;
}

interface MediaMetadata {
    camera_metadata: CameraMetadata;
    photo_metadata?: PhotoMetadata;
}

interface CameraMetadata {
    has_camera_metadata: boolean;
}

interface PhotoMetadata {
    exif_data: ExifDatum[];
}

interface ExifDatum {
    date_time_original?: string;
    source_type: string;
}

export interface InstagramPost {
    media: Media[];
    title?: string;
    creation_timestamp?: number;
}