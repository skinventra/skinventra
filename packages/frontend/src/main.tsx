import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import './index.css'
import App from './App.tsx'
import {
  STALE_TIME,
  GARBAGE_COLLECTION_TIME,
  RETRY_COUNT,
  REFETCH_ON_WINDOW_FOCUS,
  REFETCH_ON_RECONNECT,
} from './config/reactQuery'

// Create a client with optimized settings for production
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: STALE_TIME,
      gcTime: GARBAGE_COLLECTION_TIME,
      retry: RETRY_COUNT,
      refetchOnWindowFocus: REFETCH_ON_WINDOW_FOCUS,
      refetchOnReconnect: REFETCH_ON_RECONNECT,
    },
  },
})

// Create persister for localStorage
const persister = createSyncStoragePersister({
  storage: window.localStorage,
  key: 'SKINVENTRA_REACT_QUERY_CACHE',
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PersistQueryClientProvider 
      client={queryClient} 
      persistOptions={{ persister }}
    >
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </PersistQueryClientProvider>
  </StrictMode>,
)
