import { type AppType } from "next/dist/shared/lib/utils";

import "../styles/globals.css";

import { MantineProvider, createEmotionCache } from "@mantine/core";
import rtlPlugin from "stylis-plugin-rtl";

const rtlCache = createEmotionCache({
  key: "mantine-rtl",
  stylisPlugins: [rtlPlugin],
});


const MyApp: AppType = ({ Component, pageProps }) => {
  return<MantineProvider
  withGlobalStyles
  withNormalizeCSS
  emotionCache={rtlCache}
  theme={{ dir: "rtl" }}
> <Component {...pageProps} />
</MantineProvider>;
};

export default MyApp;
