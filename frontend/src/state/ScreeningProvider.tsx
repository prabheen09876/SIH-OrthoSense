import { useState, type ReactNode } from 'react'
import { defaultScreeningProfile, ScreeningContext, type ScreeningProfile } from './screening-context'

export default function ScreeningProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<ScreeningProfile>(defaultScreeningProfile)
  return <ScreeningContext.Provider value={{ profile, setProfile }}>{children}</ScreeningContext.Provider>
}
