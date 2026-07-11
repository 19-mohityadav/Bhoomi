import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'
import App from './App.jsx'

import { WagmiProvider } from 'wagmi'
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { wagmiConfig } from './web3Config'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: '#00eefc',
            accentColorForeground: '#0c0e16',
            borderRadius: 'large',
            fontStack: 'system',
          })}
          locale="en-US"
        >
          <App />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </StrictMode>,
)

