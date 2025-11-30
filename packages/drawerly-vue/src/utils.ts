/**
 * Omit a set of keys from a type.
 *
 * Similar to the built-in `Omit<T, K>` but written as a mapped type to
 * avoid some of the IntelliSense quirks.
 *
 * @internal
 */
export type OmitKeys<T, K extends keyof any> = {
  [P in keyof T as P extends K ? never : P]: T[P]
}
