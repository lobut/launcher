export type TracerStrategy = {
  scan(): Promise<SettingsType[]>;
};

export type SettingsType = {
  exec: string;
  name: string;
  icon: string;
  categories: string;
  comment: string;
  type: string;
};
export function notEmpty<TValue>(value: TValue | null | undefined): value is TValue {
  return value !== null && value !== undefined;
}
