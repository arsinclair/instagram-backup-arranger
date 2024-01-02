enum Software {
    AdobePhotoshop244Windows = "Adobe Photoshop 24.4 (Windows)",
    Gimp21032 = "GIMP 2.10.32",
    MediaTekCameraApplication = "MediaTek Camera Application",
}

enum CameraPosition {
    Back = "back",
    Front = "front",
    Unknown = "unknown",
}

enum DeviceID {
    AndroidD19530Fa12804519 = "android-d19530fa12804519",
}

enum SceneCaptureType {
    Standard = "standard",
}

interface ExifDatum {
    scene_capture_type?:  SceneCaptureType;
    software?:            Software;
    device_id?:           DeviceID;
    camera_position?:     CameraPosition;
    date_time_digitized?: string;
    date_time_original?:  string;
    source_type?:         string;
    latitude?:            number;
    longitude?:           number;
}

interface Metadata {
    exif_data:    ExifDatum[];
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

interface CrossPostSource {
    source_app: SourceApp;
}

enum SourceApp {
    Fb = "FB",
}

export type InstagramStory = {
    uri:                string;
    creation_timestamp: number;
    media_metadata:     MediaMetadata;
    title:              string;
    cross_post_source:  CrossPostSource;
};

export type InstagramStories = {
    ig_stories: InstagramStory[];
};