export const UNAUTHORIZED_EVENT = 'sigip:unauthorized'

let sessionGeneration = 0

export function getSessionGeneration(): number {
  return sessionGeneration
}

export function advanceSessionGeneration(): number {
  sessionGeneration += 1
  return sessionGeneration
}

export function dispatchUnauthorized(generation: number): void {
  window.dispatchEvent(
    new CustomEvent<number>(UNAUTHORIZED_EVENT, { detail: generation }),
  )
}
