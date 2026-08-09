import type { InjectionKey } from 'vue'
import type { Drawerly } from './drawerly'

/**
 * Injection key for the {@link Drawerly} instance.
 *
 * @public
 */
export const drawerlyInjectionKey: InjectionKey<Drawerly> = Symbol('drawerly')
