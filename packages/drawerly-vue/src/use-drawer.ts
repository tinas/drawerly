import type { DrawerKey } from '@drawerly/core'
import type { VueDrawerOptions } from './plugin'
import { onMounted, onUnmounted, readonly, ref } from 'vue'
import { useDrawerContext } from './use-drawer-context'

/**
 * Options accepted by {@link useDrawer}.
 *
 * This is just {@link VueDrawerOptions} (or your extension of it).
 * `drawerKey` is the identity; no extra properties are added.
 */
export type UseDrawerOptions<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> = TDrawerOptions

export interface UseDrawerResult<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
> {
  open: (overrides?: Partial<TDrawerOptions>) => DrawerKey
  close: () => void
  bringToTop: () => void
  isOpen: Readonly<{ value: boolean }>
}

/**
 * Creates a handle bound to a single drawer identified by `drawerKey`.
 *
 * Example:
 * ```ts
 * const { open } = useDrawer({
 *   drawerKey: 'settings-drawer',
 *   component: SettingsDrawer,
 *   placement: 'right',
 *   dataAttributes: {
 *     'data-drawer-key': 'settings-drawer',
 *   },
 *   props: { userId: '123' },
 * })
 *
 * open()
 * ```
 *
 * You can also extend VueDrawerOptions:
 * ```ts
 * interface SettingsOptions extends VueDrawerOptions {
 *   props: {
 *     userId: string
 *     tab?: 'profile' | 'billing'
 *   }
 * }
 *
 * const { open } = useDrawer<SettingsOptions>({
 *   drawerKey: 'settings-drawer',
 *   component: SettingsDrawer,
 *   placement: 'right',
 *   props: { userId: '123' },
 * })
 * ```
 */
export function useDrawer<
  TDrawerOptions extends VueDrawerOptions = VueDrawerOptions,
>(options: UseDrawerOptions<TDrawerOptions>): UseDrawerResult<TDrawerOptions> {
  const manager = useDrawerContext()
  const isOpenRef = ref(false)

  const baseKey: DrawerKey = options.drawerKey

  const computeIsOpen = (): void => {
    const state = manager.getState()
    isOpenRef.value = state.stack.some(inst => inst.drawerKey === baseKey)
  }

  let unsubscribe: (() => void) | null = null

  onMounted(() => {
    computeIsOpen()
    unsubscribe = manager.subscribe(() => {
      computeIsOpen()
    })
  })

  onUnmounted(() => {
    unsubscribe?.()
  })

  const open = (overrides?: Partial<TDrawerOptions>): DrawerKey => {
    const merged = {
      ...(options as VueDrawerOptions),
      ...(overrides ?? {}),
      // ensure identity stays consistent unless user explicitly changes it
      drawerKey: (overrides as Partial<VueDrawerOptions> | undefined)?.drawerKey
        ?? baseKey,
    } satisfies VueDrawerOptions

    manager.open(merged)

    return merged.drawerKey
  }

  const close = (): void => {
    manager.close(baseKey)
  }

  const bringToTop = (): void => {
    manager.bringToTop(baseKey)
  }

  return {
    open,
    close,
    bringToTop,
    isOpen: readonly(isOpenRef),
  }
}
