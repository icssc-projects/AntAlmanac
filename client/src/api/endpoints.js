function endpointTransform(path) {
    if (process.env.NODE_ENV === 'development') return path;
    else return `https://api.antalmanac.com${path}`;
}

export const WEBSOC_ENDPOINT = endpointTransform('/api/websocapi');
export const LOOKUP_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/lookupNotifications');
export const REGISTER_NOTIFICATIONS_ENDPOINT = endpointTransform('/api/notifications/registerNotifications');
export const RANDOM_AD_ENDPOINT = endpointTransform('/api/banners/getRandomAd');
export const AD_IMAGE_ENDPOINT = endpointTransform('/api/banners/getAdImage');
export const LOAD_DATA_ENDPOINT = endpointTransform('/api/users/loadUserData');
export const SAVE_DATA_ENDPOINT = endpointTransform('/api/users/saveUserData');
export const ENROLLMENT_DATA_ENDPOINT = endpointTransform('/api/enrollmentData');
export const PETERPORTAL_DATA_ENDPOINT = endpointTransform('/api/peterportalapi');
export const NEWS_ENDPOINT = endpointTransform('/api/news');
