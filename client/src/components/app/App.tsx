import { ChakraProvider } from '@chakra-ui/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { ReactElement } from 'react';
import { queryClient } from '../../react-query/queryClient';
// @ts-expect-error
import theme from '../../theme';
import { Loading } from './Loading';
import { Navbar } from './Navbar';
import { AppRoutes } from './Routes';

export default function App(): ReactElement {
  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <Navbar />
        <Loading />
        <AppRoutes />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ChakraProvider>
  );
}
