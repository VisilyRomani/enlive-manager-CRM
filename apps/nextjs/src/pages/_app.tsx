// src/pages/_app.tsx
import "../styles/globals.css";
import { trpc } from "../utils/trpc";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import type { AppProps } from "next/app";
import { ReactElement, ReactNode } from "react";
import { NextPage } from "next";
import Layout from "../component/navigation/Layout";
import Head from "next/head";
import AppLayout from "../component/navigation/AppLayout";
// eslint-disable-next-line @typescript-eslint/ban-types
export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactElement;
};

export type AppPropsWithLayout<P> = AppProps<P> & {
  Component: NextPageWithLayout<P>;
};

const MyApp = ({
  Component,
  pageProps,
  router,
}: AppPropsWithLayout<{ session: Session }>) => {
  const getLayout = (page: ReactNode) => {
    if (router.pathname.startsWith("/admin")) {
      return <Layout>{page}</Layout>;
    } else if (router.pathname.startsWith("/app")) {
      return <AppLayout>{page}</AppLayout>;
    } else {
      return page;
    }
  };

  return (
    <SessionProvider session={pageProps.session}>
      <Head>
        <meta name="apple-mobile-web-app-status-bar" content="#90cdf4" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" color="#ffffff"></meta>
      </Head>
      {getLayout(
        <>
          <Component {...pageProps} />
          <ToastContainer />
        </>
      )}
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
