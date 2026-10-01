export interface PickerOption<T extends string> {
  value: T;
  label: string;
  hint?: string;
}

/** Options whose label is the value itself, the common case for branches, models and sources. */
export const optionsOf = <T extends string>(values: readonly T[]): PickerOption<T>[] =>
  values.map((value) => ({ value, label: value }));
