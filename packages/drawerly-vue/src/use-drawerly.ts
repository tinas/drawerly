import type { Drawerly } from './drawerly'
import type { VueDrawerOptions } from './types'
import { inject } from 'vue'
import { drawerlyInjectionKey } from './injection'

/**
 * Returns the installed {@link Drawerly} instance.
 *
 * @public
 */
export function useDrawerly<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(): Drawerly<TDrawerOptions> {
  const drawerly = inject(drawerlyInjectionKey)

  if (!drawerly) {
    throw new Error(
      '[@drawerly/vue] useDrawerly() must be used after installing the instance created by createDrawerly().',
    )
  }

  return drawerly as Drawerly<TDrawerOptions>
}
