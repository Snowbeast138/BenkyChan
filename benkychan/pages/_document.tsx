/**
 * Custom Document component (pages/_document.tsx)
 * 
 * This file is used to customize the HTML document structure for your Next.js application.
 * It's only rendered on the server side and is used to change the initial server-side rendered document markup.
 * 
 * Key responsibilities:
 * - Define the HTML document structure
 * - Set default lang attribute for accessibility
 * - Add elements to <head> that should be available on all pages
 * - Customize the <body> attributes
 * - Initialize the Next.js page rendering structure
 */

// Import required Next.js Document components
import { Html, Head, Main, NextScript } from "next/document";

/**
 * Custom Document component
 * 
 * This component extends Next.js's default Document behavior.
 * It's rendered once on the server when the page is first requested.
 * 
 * Note: This component should only include static markup and should not
 * include any dynamic logic or state management.
 */
export default function Document() {
  return (
    /**
     * The <Html> component wraps the entire document.
     * 
     * Important attributes:
     * - lang: Specifies the language of the document (important for accessibility and SEO)
     */
    <Html lang="en">
      {/**
       * The <Head> component is used to define elements in the document's <head>.
       * 
       * Common use cases:
       * - Meta tags (charset, viewport, etc.)
       * - Favicon links
       * - Font imports
       * - Global CSS includes
       * - SEO meta tags
       * 
       * Note: Unlike next/head, this Head component is only rendered once on the server.
       */}
      <Head />

      {/**
       * The <body> element contains all page content.
       * 
       * className "antialiased" applies smooth font rendering (common Tailwind class)
       * 
       * You can add:
       * - Global body classes
       * - Static elements that should appear on every page
       * - No interactive elements should be added here
       */}
      <body className="antialiased">
        {/**
         * The <Main> component renders the active page component.
         * This is where your page content will be injected.
         */}
        <Main />

        {/**
         * The <NextScript> component is required for Next.js to work properly.
         * It includes all the necessary scripts for:
         * - Client-side hydration
         * - Page navigation
         * - Webpack runtime
         * 
         * Important: Don't remove this or your app won't work properly.
         */}
        <NextScript />
      </body>
    </Html>
  );
}

/**
 * When to customize _document.tsx:
 * 
 * 1. To add analytics scripts that need to load before page content
 * 2. To set custom attributes on the HTML or BODY elements
 * 3. To add custom fonts or CSS that must be available immediately
 * 4. To implement server-side styling solutions (like styled-components)
 * 5. To add static meta tags that should be on every page
 * 
 * When NOT to customize _document.tsx:
 * 
 * 1. For dynamic content (use _app.tsx or page components instead)
 * 2. For state management
 * 3. For anything that needs to update on client-side navigation
 * 
 * Example customizations:
 * 
 * 1. Adding Google Fonts:
 *    <Head>
 *      <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
 *    </Head>
 * 
 * 2. Adding dark mode class:
 *    <body className="antialiased dark:bg-gray-900">
 * 
 * 3. Adding analytics script:
 *    <Head>
 *      <script async src="https://analytics.example.com/script.js" />
 *    </Head>
 */