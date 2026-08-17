export function startOfDayUtc(reference: Date = new Date()): Date {
  return new Date(
    Date.UTC(
      reference.getUTCFullYear(),
      reference.getUTCMonth(),
      reference.getUTCDate(),
    ),
  );
}

export function startOfMonthUtc(reference: Date = new Date()): Date {
  return new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
}

export function startOfNextMonthUtc(reference: Date = new Date()): Date {
  return new Date(
    Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1),
  );
}

export function startOfYearUtc(reference: Date = new Date()): Date {
  return new Date(Date.UTC(reference.getUTCFullYear(), 0, 1));
}

export function startOfNextYearUtc(reference: Date = new Date()): Date {
  return new Date(Date.UTC(reference.getUTCFullYear() + 1, 0, 1));
}