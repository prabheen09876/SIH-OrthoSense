import { createContext, useContext, type Dispatch, type SetStateAction } from 'react'

export type ScreeningProfile = {
  name: string
  age: number
  sex: string
  height: number
  weight: number
  state: string
  site: string
  language: string
  referral: string
  joint: string
  duration: string
  pain: number
  notes: string
}

export const defaultScreeningProfile: ScreeningProfile = {
  name: 'Lalrempuii Sailo',
  age: 58,
  sex: 'female',
  height: 157,
  weight: 64,
  state: 'Mizoram',
  site: 'Aizawl West PHC',
  language: 'Mizo',
  referral: 'Zoram Medical College',
  joint: 'Left knee',
  duration: '3–6 months',
  pain: 6,
  notes: 'Pain increases during downhill walking and after prolonged farm work.',
}

export type ScreeningContextValue = {
  profile: ScreeningProfile
  setProfile: Dispatch<SetStateAction<ScreeningProfile>>
}

export const ScreeningContext = createContext<ScreeningContextValue | null>(null)

export function useScreening() {
  const context = useContext(ScreeningContext)
  if (!context) throw new Error('useScreening must be used inside ScreeningProvider')
  return context
}
