import type { DrawerInstance } from '@drawerly/core'
import type { Drawerly } from './drawerly'
import type { ReactDrawerOptions } from './types'
import { useMemo, useSyncExternalStore } from 'react'

/**
 * Returned by {@link useDrawerly}.
 *
 * @public
 */
export interface UseDrawerlyResult<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
> extends Drawerly<TDrawerOptions> {
  /**
   * Current drawer stack. The last item is the topmost drawer.
   */
  stack: readonly DrawerInstance<TDrawerOptions>[]
}

/**
 * Subscribes to a {@link Drawerly} instance and returns its manager API
 * together with the drawer stack.
 *
 * @public
 */
export function useDrawerly<
  TDrawerOptions extends ReactDrawerOptions = ReactDrawerOptions,
>(drawerly: Drawerly<TDrawerOptions>): UseDrawerlyResult<TDrawerOptions> {
  if (!drawerly) {
    throw new Error(
      '[@drawerly/react] useDrawerly() requires an instance created by createDrawerly().',
    )
  }

  const state = useSyncExternalStore(
    drawerly.subscribe,
    drawerly.getState,
    drawerly.getState,
  )

  return useMemo(
    () => ({
      ...drawerly,
      stack: state.stack,

      // Reading through the subscribed snapshot keeps render output
      // consistent with the stack this render was given.
      getState: () => state,
      getDrawerInstance: key => state.stack.find(d => d.drawerKey === key),
      getTopDrawer: () => state.stack[state.stack.length - 1],
      isOpen: key => state.stack.some(d => d.drawerKey === key),
    }),
    [drawerly, state],
  )
}
