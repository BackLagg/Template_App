export const AppConstants = {
  TIME: {
    MILLISECONDS: {
      SECOND: 1000,
      MINUTE: 60 * 1000,
      HOUR: 60 * 60 * 1000,
      DAY: 24 * 60 * 60 * 1000,
      WEEK: 7 * 24 * 60 * 60 * 1000,
    },
    SECONDS: {
      MINUTE: 60,
      HOUR: 3600,
      DAY: 86400,
      WEEK: 604800,
    },
    DAYS: {
      TOKEN_EXPIRY: 30,
      RECENT_VIEWS_RETENTION: 7,
    },
  },

  PERCENTAGE: {
    HUNDRED: 100,
    DEFAULT_COMMISSION_RATE: 20,
    CONVERSION_RATE_MULTIPLIER: 100,
    ROUNDING_PRECISION: 10,
  },

  FILE_SIZE: {
    BYTES: {
      KB: 1024,
      MB: 1024 * 1024,
    },
    LIMITS: {
      IMAGE: 5 * 1024 * 1024,
      AVATAR: 2 * 1024 * 1024,
      DOCUMENT: 10 * 1024 * 1024,
      MAX: 50 * 1024 * 1024,
      JSON_BODY: 50 * 1024 * 1024,
    },
  },

  LIMITS: {
    PAGINATION: {
      DEFAULT: 10,
      WALLET_TRANSACTIONS: 20,
      DISCOVERY_USERS: 10,
      DONATION_HISTORY: 50,
      RECENT_VIEWS: 7,
    },
    AMOUNTS: {
      MAX_DONATION: 1000,
      MAX_WALLET_AMOUNT: 1000000,
      MAX_PRODUCT_PRICE: 1000000,
      MAX_PRODUCT_REWARD: 1000000,
      MAX_REFERRAL_EARNINGS: 1000000,
      MAX_CUSTOM_REWARD: 1000000,
    },
    STRING_LENGTH: {
      TELEGRAM_ID_MIN: 5,
      TELEGRAM_ID_MAX: 15,
      TOKEN_LENGTH: 32,
      PRODUCT_TITLE_MAX: 100,
      PRODUCT_DESCRIPTION_MAX: 500,
      CATEGORY_NAME_MAX: 50,
      PROFILE_NAME_MAX: 100,
      PROFILE_BIO_MAX: 500,
      TRANSACTION_DESCRIPTION_MAX: 200,
      EDITOR_NAME_MAX: 50,
      EDITOR_DESCRIPTION_MAX: 100,
      EDITOR_BIO_MAX: 500,
    },
  },

  PORTS: {
    BACKEND_DEFAULT: 8080,
    FRONTEND_DEFAULT: 3000,
    PAYMENT_SERVICE_DEFAULT: 3001,
    MONGODB_DEFAULT: 27017,
    REDIS_DEFAULT: 6379,
    REDIS_DEV: 6381,
  },

  TIMEOUTS: {
    HTTP: {
      SHORT: 5000,
      MEDIUM: 10000,
      LONG: 30000,
      VERY_LONG: 300000,
    },
    REDIS: {
      RETRY_DELAY: 500,
      MAX_RETRY_DELAY: 2000,
      RETRY_MULTIPLIER: 50,
    },
  },

  CACHE: {
    TTL: {
      REFERRAL_STATS_SECONDS: 5 * 60,
      HEALTH_CHECK_SECONDS: 5,
      USER_DATA_MINUTES: 15,
      ICO_FUNDING_SECONDS: 5 * 60,
      CLEANUP_INTERVAL_MS: 5 * 60 * 1000,
    },
    TTL_BY_ACTIVITY: {
      ACTIVE_USER_MINUTES: 3,
      RECENTLY_UPDATED_MINUTES: 10,
      RECENTLY_UPDATED_HOURS: 30,
      INACTIVE_USER_MINUTES: 1,
      INACTIVE_RECENT_MINUTES: 2,
      INACTIVE_RECENT_HOURS: 5,
      INACTIVE_OLD_MINUTES: 15,
      DEFAULT_MINUTES: 2,
    },
  },

  DONATION: {
    LEVELS: {
      NONE: 0,
      LEVEL_1: 1,
      LEVEL_2: 2,
      LEVEL_3: 3,
      LEVEL_4: 4,
      LEVEL_5: 5,
    },
    THRESHOLDS: {
      LEVEL_1_MIN: 10,
      LEVEL_2_MIN: 50,
      LEVEL_3_MIN: 100,
      LEVEL_4_MIN: 1000,
      LEVEL_5_MIN: 10000,
    },
  },

  REFERRAL: {
    CODE_PREFIX: 'ref',
    CODE_PREFIX_LENGTH: 3,
    DEFAULT_COMMISSION_RATE: 20,
    TOKEN_EXPIRY_DAYS: 30,
    TOKEN_BYTES: 16,
  },

  VALIDATION: {
    TELEGRAM_ID: {
      MIN_LENGTH: 5,
      MAX_LENGTH: 15,
      PATTERN: /^\d{5,15}$/,
    },
    REFERRAL_CODE: {
      PATTERN: /^ref\d{5,15}$/,
    },
    TOKEN: {
      LENGTH: 32,
    },
  },

  METRICS: {
    BUCKETS: {
      HTTP_DURATION: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      HTTP_DURATION_EXTENDED: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      AUTH_DURATION: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      CACHE_DURATION: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
      CACHE_DURATION_EXTENDED: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      WALLET_DURATION: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
      DATABASE_DURATION: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
    },
  },

  HTTP: {
    STATUS: {
      SERVER_ERROR_THRESHOLD: 500,
      CLIENT_ERROR_THRESHOLD: 400,
      SUCCESS: 200,
    },
  },

  MONGO: {
    ERROR_CODES: {
      DUPLICATE_KEY: 11000,
    },
  },

  TELEGRAM: {
    AUTH: {
      SECRET_KEY_PREFIX: 'WebAppData',
      HMAC_ALGORITHM: 'sha256',
      MAX_TOKEN_AGE_SECONDS: 86400, // 24 часа
    },
    CACHE: {
      NEW_USER_DAYS: 1,
      ACTIVE_USER_DAYS: 1,
      RECENT_USER_DAYS: 7,
    },
  },

  ROUNDING: {
    DECIMAL_PLACES: {
      ONE: 1,
      TWO: 2,
    },
    MULTIPLIERS: {
      ONE_DECIMAL: 10,
      TWO_DECIMALS: 100,
    },
  },

  ADMIN: {
    POLLING_INTERVAL_MS: 3000,
  },

  REGEX: {
    CONTROL_CHARS: /[\x00-\x1F\x7F]/g,
    CONTROL_CHARS_EXTENDED: /[\r\n\u0000-\u001F\u007F-\u009F]/g,
    SQL_INJECTION: /('|(--)|;|\/\*|\*\/|xp_|sp_)/gi,
    NOSQL_INJECTION: /(\$where|\$ne|\$gt|\$lt)/gi,
    HTML_TAGS: /<[^>]*>/g,
  },
} as const;
