import { Module } from '@nestjs/common';
import {
  Field,
  ObjectType,
  Query,
  registerEnumType,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';

import { Config, DeploymentType, URLHelper } from '../fundamentals';
import { Public } from './auth';

export enum ServerFeature {
  Copilot = 'copilot',
  Payment = 'payment',
  OAuth = 'oauth',
}

registerEnumType(ServerFeature, {
  name: 'ServerFeature',
});

registerEnumType(DeploymentType, {
  name: 'ServerDeploymentType',
});

const ENABLED_FEATURES: Set<ServerFeature> = new Set();
export function ADD_ENABLED_FEATURES(feature: ServerFeature) {
  ENABLED_FEATURES.add(feature);
}

@ObjectType()
export class PasswordLimitsType {
  @Field()
  minLength!: number;
  @Field()
  maxLength!: number;
}

@ObjectType()
export class CredentialsRequirementType {
  @Field()
  password!: PasswordLimitsType;
}

@ObjectType()
export class ServerConfigType {
  @Field({
    description:
      'server identical name could be shown as badge on user interface',
  })
  name!: string;

  @Field({ description: 'server version' })
  version!: string;

  @Field({ description: 'server base url' })
  baseUrl!: string;

  @Field(() => DeploymentType, { description: 'server type' })
  type!: DeploymentType;

  /**
   * @deprecated
   */
  @Field({ description: 'server flavor', deprecationReason: 'use `features`' })
  flavor!: string;

  @Field(() => [ServerFeature], { description: 'enabled server features' })
  features!: ServerFeature[];

  @Field({ description: 'enable telemetry' })
  enableTelemetry!: boolean;
}

@Resolver(() => ServerConfigType)
export class ServerConfigResolver {
  constructor(
    private readonly config: Config,
    private readonly url: URLHelper
  ) {}
  @Public()
  @Query(() => ServerConfigType, {
    description: 'server config',
  })
  serverConfig(): ServerConfigType {
    return {
      name: this.config.serverName,
      version: this.config.version,
      baseUrl: this.url.home,
      type: this.config.type,
      // BACKWARD COMPATIBILITY
      // the old flavors contains `selfhosted` but it actually not flavor but deployment type
      // this field should be removed after frontend feature flags implemented
      flavor: this.config.type,
      features: Array.from(ENABLED_FEATURES),
      enableTelemetry: this.config.metrics.telemetry.enabled,
    };
  }

  @ResolveField(() => CredentialsRequirementType, {
    description: 'credentials requirement',
  })
  async credentialsRequirement() {
    const config = await this.config.runtime.fetchAll({
      'auth/password.max': true,
      'auth/password.min': true,
    });

    return {
      password: {
        minLength: config['auth/password.min'],
        maxLength: config['auth/password.max'],
      },
    };
  }
}

@Module({
  providers: [ServerConfigResolver],
})
export class ServerConfigModule {}
