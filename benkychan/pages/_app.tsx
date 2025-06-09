/**
 * This is the root component of your Next.js application.
 * It initializes all pages and is the top-level component that wraps every page.
 * 
 * Key responsibilities:
 * - Initialize page components with their props
 * - Maintain layout persistence between page transitions
 * - Inject global CSS styles
 * - Provide shared context to all pages
 */

// Import global CSS styles that will be applied across the entire application
import "@/styles/globals.css";

// Import the AppProps type from Next.js for proper type checking
import type { AppProps } from "next/app";

/**
 * The main App component that wraps all pages in the application.
 * 
 * @param {AppProps} props - The component props containing:
 *   @param {React.ComponentType} Component - The current page component to render
 *   @param {object} pageProps - The initial props passed to the page component
 * 
 * @returns {JSX.Element} The rendered application with the current page
 */
export default function App({ Component, pageProps }: AppProps) {
  /**
   * Render the current page component with its props.
   * 
   * This is where you would typically add:
   * - Layout components (headers, footers)
   * - Context providers (theme, authentication)
   * - Global modals or notifications
   * - Error boundaries
   */
  return <Component {...pageProps} />;
}

/**
 * Notes about customizing this file:
 * 
 * 1. To persist layouts between page changes, wrap Component in a layout component:
 *    return (
 *      <Layout>
 *        <Component {...pageProps} />
 *      </Layout>
 *    );
 * 
 * 2. To add global providers (like theme or auth):
 *    return (
 *      <ThemeProvider>
 *        <AuthProvider>
 *          <Component {...pageProps} />
 *        </AuthProvider>
 *      </ThemeProvider>
 *    );
 * 
 * 3. To add error boundaries:
 *    return (
 *      <ErrorBoundary>
 *        <Component {...pageProps} />
 *      </ErrorBoundary>
 *    );
 * 
 * 4. To add global page transitions:
 *    return (
 *      <AnimatePresence mode="wait">
 *        <Component key={router.route} {...pageProps} />
 *      </AnimatePresence>
 *    );
 */