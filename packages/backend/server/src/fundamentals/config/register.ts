import { Prisma } from '@prisma/client';
import { get, merge, set } from 'lodash-es';

import {
  AppModulesConfigDef,
  AppStartupConfig,
  ModuleRuntimeConfigDescriptions,
  ModuleStartupConfigDescriptions,
  RuntimeConfigDescription,
} from './types';

export const defaultStartupConfig: AppStartupConfig = {} as any;
export const defaultRuntimeConfig: Record<
  string,
  Prisma.AppRuntimeSettingCreateInput
> = {} as any;

function registerRuntimeConfig(
  module: string,
  configs: Record<string, any>,
  parent = ''
) {
  Object.entries(configs).forEach(([key, value]) => {
    if (parent) {
      key = `${parent}.${key}`;
    }

    // config item
    if ('desc' in value && typeof value.desc === 'string') {
      const item = value as RuntimeConfigDescription<any>;

      defaultRuntimeConfig[`${module}/${key}`] = {
        id: `${module}/${key}`,
        module,
        key,
        description: item.desc,
        value: item.default,
      };
    } else {
      parent = key;
      registerRuntimeConfig(module, value, parent);
    }
  });
}

export function defineStartupConfig<T extends keyof AppModulesConfigDef>(
  module: T,
  configs: ModuleStartupConfigDescriptions<AppModulesConfigDef[T]>
) {
  set(
    defaultStartupConfig,
    module,
    merge(get(defaultStartupConfig, module, {}), configs)
  );
}

export function defineRuntimeConfig<T extends keyof AppModulesConfigDef>(
  module: T,
  configs: ModuleRuntimeConfigDescriptions<AppModulesConfigDef[T]>
) {
  registerRuntimeConfig(module, configs);
}
