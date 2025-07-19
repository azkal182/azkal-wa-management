// Type Imports
import type { ChildrenType, Direction } from '@core/types'

// Context Imports
import { VerticalNavProvider } from '@menu/contexts/verticalNavContext'
import { SettingsProvider } from '@core/contexts/settingsContext'
import ThemeProvider from '@components/theme'
import QueryProviders from '@/components/providers/QueryClientProvider'

// Util Imports
import { getMode, getSettingsFromCookie, getSystemMode } from '@core/utils/serverHelpers'
import { auth } from '@/lib/auth'

type Props = ChildrenType & {
  direction: Direction
}

const Providers = async (props: Props) => {
  // Props
  const { children, direction } = props

  // Vars
  const mode = await getMode()
  const settingsCookie = await getSettingsFromCookie()
  const systemMode = await getSystemMode()
  const session = await auth()

  return (
    <QueryProviders session={session}>
      <VerticalNavProvider>
        <SettingsProvider settingsCookie={settingsCookie} mode={mode}>
          <ThemeProvider direction={direction} systemMode={systemMode}>
            {children}
          </ThemeProvider>
        </SettingsProvider>
      </VerticalNavProvider>
    </QueryProviders>
  )
}

export default Providers
