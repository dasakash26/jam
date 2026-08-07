export const SAAVN_API_BASE = 'https://www.jiosaavn.com/api.php'
export const SAAVN_API_VERSION = '4'

export const SAAVN_DES_KEY = '38346591'
export const SAAVN_QUALITY_FALLBACKS = ['_320.mp4', '_160.mp4', '_96.mp4'] as const
export const SAAVN_TARGET_QUALITY = '_320.mp4'

export const SAAVN_IMAGE_SMALL_SIZES = ['50x50', '150x150'] as const
export const SAAVN_IMAGE_TARGET_SIZE = '500x500'

export const SAAVN_SEARCH_RESULTS_LIMIT = 30

export const STREAM_CACHE_TTL_MS = 60 * 60 * 1000
export const STREAM_CACHE_MAX_SIZE = 1000
export const STREAM_CACHE_EVICT_COUNT = 100

export const ROOM_SWEEP_INTERVAL_MS = 15 * 1000
export const ROOM_USER_STALE_THRESHOLD_MS = 45 * 1000
export const ROOM_HISTORY_MAX_LENGTH = 50

export const ID_CHARSET = '23456789abcdefghjkmnpqrstuvwxyz'
export const ROOM_ID_PREFIX = 'room_'
export const ROOM_ID_LENGTH = 6
export const QUEUE_ITEM_ID_PREFIX = 'item_'
export const QUEUE_ITEM_ID_LENGTH = 6

export const CORS_MAX_AGE = 86_400
export const SERVER_IDLE_TIMEOUT = 60
export const CORS_EXPOSED_HEADERS = ['Content-Length', 'Content-Range', 'Accept-Ranges']

export const STREAM_DEFAULT_CONTENT_TYPE = 'audio/mp4'
export const STREAM_CACHE_CONTROL = 'public, max-age=3600'
