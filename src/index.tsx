import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import { cssTransition, ToastContainer } from 'react-toastify';
import { App } from './App';
import { AppStoreProvider } from './AppStore';

const container = document.getElementById('app')!;
const root = createRoot(container);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      refetchOnWindowFocus: false,
    },
  },
});

root.render(
  <QueryClientProvider client={queryClient}>
    <AppStoreProvider>
      <App />
      <ToastContainer
        position="top-center"
        transition={cssTransition({
          enter: 'Toastify__slide-enter',
          exit: 'Toastify__slide-exit',
          collapse: false,
          appendPosition: true,
        })}
        theme="colored"
        autoClose={3000}
        closeOnClick={true}
        closeButton={false}
        hideProgressBar={true}
      />
    </AppStoreProvider>
  </QueryClientProvider>
);
