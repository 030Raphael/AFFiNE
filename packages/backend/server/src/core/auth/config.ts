import { defineRuntimeConfig, ModuleConfig } from '../../fundamentals/config';

export interface AuthRuntimeConfigurations {
  /**
   * Whether allow anonymous users to sign up
   */
  allowSignup: boolean;
  /**
   * The minimum and maximum length of the password when registering new users
   */
  password: {
    min: number;
    max: number;
  };
  /**
   * auth session config
   */
  session: {
    /**
     * Application auth expiration time in seconds
     */
    ttl: number;
    /**
     * Application auth time to refresh in seconds
     */
    ttr: number;
  };

  /**
   * Application access token config
   */
  accessToken: {
    /**
     * Application access token expiration time in seconds
     */
    ttl: number;
    /**
     * Application refresh token expiration time in seconds
     */
    refreshTokenTtl: number;
  };
}

declare module '../../fundamentals/config' {
  interface AppConfig {
    auth: ModuleConfig<never, AuthRuntimeConfigurations>;
  }
}

defineRuntimeConfig('auth', {
  allowSignup: {
    desc: 'Whether allow new registrations',
    default: true,
  },
  password: {
    min: {
      desc: 'The minimum length of user password',
      default: 8,
    },
    max: {
      desc: 'The maximum length of user password',
      default: 32,
    },
  },
  session: {
    ttl: {
      desc: 'Application auth expiration time in seconds',
      default: 15 * 24 * 60 * 60 /* 15 days */,
    },
    ttr: {
      desc: 'Application auth time to refresh in seconds',
      default: 7 * 24 * 60 * 60 /* 7 days */,
    },
  },
  accessToken: {
    ttl: {
      desc: 'Application access token expiration time in seconds',
      default: 7 * 24 * 60 * 60 /* 7 days */,
    },
    refreshTokenTtl: {
      desc: 'Application refresh token expiration time in seconds',
      default: 30 * 24 * 60 * 60 /* 30 days */,
    },
  },
});
