import '../styles/globals.css';
import Head from 'next/head';
import Script from 'next/script';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Content Personalization Tools</title>
        <meta name="description" content="Tools for testing and integrating with the content personalization service" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* Add a script to handle client-side SPA routing */}
      <Script id="spa-routing" strategy="beforeInteractive">
        {`
          // Handle SPA routing by listening for link clicks
          document.addEventListener('click', function(event) {
            // Check if the clicked element is a link
            const link = event.target.closest('a');
            if (link && link.href && link.href.startsWith(window.location.origin)) {
              // Prevent default behavior
              event.preventDefault();
              
              // Get the path
              const path = link.href.replace(window.location.origin, '');
              
              // Handle SPA navigation
              window.history.pushState({}, '', path);
              
              // Trigger a popstate event
              const popStateEvent = new PopStateEvent('popstate', { state: {} });
              dispatchEvent(popStateEvent);
            }
          });
        `}
      </Script>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp; 