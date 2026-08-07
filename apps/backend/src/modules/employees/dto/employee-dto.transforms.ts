import type { TransformFnParams } from 'class-transformer';

export function trimString({ value }: TransformFnParams): unknown {
  return typeof value === 'string' ? value.trim() : value;
}

export function trimNullableString({ value }: TransformFnParams): unknown {
  if (typeof value !== 'string') return value;

  return value.trim() || null;
}
