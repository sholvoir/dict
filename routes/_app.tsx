import { PageProps } from "$fresh/server.ts";

export default function App({ Component }: PageProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <link rel="icon" type="image/png" sizes="192x192" href="/icon/icon-192.png"/>
        <link rel="manifest" href="/manifest.json"/>
        <meta name="mobile-web-app-capable" content="yes"/>
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"/>
        <link rel="apple-touch-icon" sizes="120x120" href="/icon/icon-120.png"></link>
        <link rel="apple-touch-icon" sizes="180x180" href="/icon/icon-180.png"></link>
        <link rel="apple-touch-icon" sizes="512x512" href="/icon/icon-512.png"></link>
        <link rel="apple-touch-icon" sizes="1024x1024" href="/icon/icon-1024.png"></link>
        <meta name="theme-color" content="#E7E5E4" media="(prefers-color-scheme: light)"/>
        <meta name="theme-color" content="#292524" media="(prefers-color-scheme: dark)"/>
        <link rel="stylesheet" href="https://raw.esm.sh/gh/sholvoir/preact-components@0.0.7/static/button-ripple.css" crossOrigin=""/>
        <link rel="stylesheet" href="https://raw.esm.sh/gh/sholvoir/preact-components@0.0.7/static/input-text.css" crossOrigin=""/>
        <link rel="stylesheet" href="/styles.css"/>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"/>
        <title>Dict</title>
      </head>
      <body class="bg-stone-200 text-stone-800 dark:bg-stone-800 dark:text-stone-300">
        <Component />
      </body>
    </html>
  );
}
