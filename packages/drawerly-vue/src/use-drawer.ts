import { onMounted, onUnmounted, readonly, ref } from 'vue'
import type { DrawerKey } from '@drawerly/core'
import { useDrawerContext } from './use-drawer-context'
import type { VueDrawerOptions } from './plugin'

/**
 * Options accepted by {@link useDrawer}.
 *
 * This is just {@link VueDrawerOptions} (or your extension of it).
 * `drawerKey` is the identity; no extra properties are added.
 */
export type UseDrawerOptions<O extends VueDrawerOptions = VueDrawerOptions> = O

export interface UseDrawerResult {
  open(overrides?: Partial<VueDrawerOptions>): DrawerKey
  close(): void
  bringToTop(): void
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
export function useDrawer<O extends VueDrawerOptions = VueDrawerOptions>(
  options: UseDrawerOptions<O>,
): UseDrawerResult {
  const manager = useDrawerContext()
  const isOpenRef = ref(false)

  const baseKey: DrawerKey = options.drawerKey

  const computeIsOpen = () => {
    const state = manager.getState()
    isOpenRef.value = state.stack.some((inst) => inst.drawerKey === baseKey)
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

  const open = (overrides?: Partial<VueDrawerOptions>): DrawerKey => {
    const merged = {
      ...(options as VueDrawerOptions),
      ...(overrides ?? {}),
      // ensure identity stays consistent unless user explicitly changes it
      drawerKey: overrides?.drawerKey ?? baseKey,
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
