import { z } from "zod";
import { createTool } from "@mastra/core/tools";

const paywallTypes = ["modal", "inline", "full-page", "button"] as const;
const paywallStyles = ["minimal", "gradient", "card", "hero"] as const;

export const integratePaywallTool = createTool({
  id: "integrate_paywall",
  name: "Integrate Paywall",
  description: "Generate and integrate a paywall component into the customer's app",
  inputSchema: z.object({
    productPriceId: z.string().describe("The Polar product price ID"),
    type: z.enum(paywallTypes).describe("Type of paywall to create"),
    style: z.enum(paywallStyles).describe("Visual style of the paywall"),
    location: z.string().describe("Where to add the paywall (file path or component)"),
    features: z.array(z.string()).optional().describe("List of features to display"),
    buttonText: z.string().default("Subscribe Now"),
    title: z.string().default("Upgrade to Premium"),
    description: z.string().optional(),
  }),
  execute: async (input) => {
    const { productPriceId, type, style, features, buttonText, title, description } = input;

    // generate paywall component code based on type and style
    let componentCode = "";

    if (type === "modal") {
      componentCode = generateModalPaywall({
        productPriceId,
        style,
        features,
        buttonText,
        title,
        description,
      });
    } else if (type === "inline") {
      componentCode = generateInlinePaywall({
        productPriceId,
        style,
        features,
        buttonText,
        title,
        description,
      });
    } else if (type === "full-page") {
      componentCode = generateFullPagePaywall({
        productPriceId,
        style,
        features,
        buttonText,
        title,
        description,
      });
    } else if (type === "button") {
      componentCode = generateButtonPaywall({
        productPriceId,
        buttonText,
      });
    }

    // also generate the subscription check hook
    const hookCode = generateSubscriptionHook();

    return {
      success: true,
      componentCode,
      hookCode,
      instructions: `
1. Add the paywall component to your app
2. Import and use the useSubscription hook to check subscription status
3. The paywall will redirect to mclorable.com for checkout
4. After successful payment, users will be redirected back to your app
      `.trim(),
    };
  },
});

function generateModalPaywall(params: any) {
  const { productPriceId, style, features, buttonText, title, description } = params;
  
  return `
"use client";

import { useState, useEffect } from "react";
import { useSubscription } from "./hooks/useSubscription";

export function PaywallModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasActiveSubscription, checkSubscription } = useSubscription();

  useEffect(() => {
    // show paywall if user doesn't have active subscription
    if (!hasActiveSubscription) {
      setOpen(true);
    }
  }, [hasActiveSubscription]);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://mclorable.com/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productPriceId: "${productPriceId}",
          appId: window.location.pathname.split("/")[2], // extract app id
        }),
      });
      
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (hasActiveSubscription) return null;

  return (
    <div className="${style === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-white'} ${open ? 'fixed inset-0 z-50 flex items-center justify-center bg-black/50' : 'hidden'}">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">${title}</h2>
        ${description ? `<p className="text-gray-600 mb-6">${description}</p>` : ''}
        ${features ? `
        <ul className="space-y-2 mb-6">
          ${features.map(f => `<li className="flex items-center"><svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>${f}</li>`).join('')}
        </ul>` : ''}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "${buttonText}"}
        </button>
      </div>
    </div>
  );
}
`.trim();
}

function generateInlinePaywall(params: any) {
  const { productPriceId, style, features, buttonText, title, description } = params;
  
  return `
"use client";

import { useState } from "react";
import { useSubscription } from "./hooks/useSubscription";

export function PaywallCard() {
  const [loading, setLoading] = useState(false);
  const { hasActiveSubscription } = useSubscription();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://mclorable.com/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productPriceId: "${productPriceId}",
          appId: window.location.pathname.split("/")[2],
        }),
      });
      
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (hasActiveSubscription) return null;

  return (
    <div className="${style === 'card' ? 'border rounded-lg shadow-lg' : ''} p-6 ${style === 'gradient' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' : 'bg-white'}">
      <h3 className="text-xl font-bold mb-3">${title}</h3>
      ${description ? `<p className="mb-4">${description}</p>` : ''}
      ${features ? `
      <ul className="space-y-1 mb-4">
        ${features.map(f => `<li>✓ ${f}</li>`).join('')}
      </ul>` : ''}
      <button
        onClick={handleSubscribe}
        disabled={loading}
        className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Loading..." : "${buttonText}"}
      </button>
    </div>
  );
}
`.trim();
}

function generateFullPagePaywall(params: any) {
  const { productPriceId, style, features, buttonText, title, description } = params;
  
  return `
"use client";

import { useState } from "react";
import { useSubscription } from "./hooks/useSubscription";

export function PaywallPage() {
  const [loading, setLoading] = useState(false);
  const { hasActiveSubscription } = useSubscription();

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://mclorable.com/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productPriceId: "${productPriceId}",
          appId: window.location.pathname.split("/")[2],
        }),
      });
      
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (hasActiveSubscription) {
    return <div>You have an active subscription!</div>;
  }

  return (
    <div className="min-h-screen ${style === 'hero' ? 'bg-gradient-to-b from-gray-50 to-white' : 'bg-white'} flex items-center justify-center">
      <div className="max-w-4xl w-full px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">${title}</h1>
          ${description ? `<p className="text-xl text-gray-600 mb-8">${description}</p>` : ''}
          ${features ? `
          <div className="grid md:grid-cols-2 gap-4 mb-8 max-w-2xl mx-auto">
            ${features.map(f => `
            <div className="flex items-center justify-start">
              <svg className="w-6 h-6 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              <span className="text-lg">${f}</span>
            </div>`).join('')}
          </div>` : ''}
          <button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-blue-600 text-white text-lg py-4 px-8 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Loading..." : "${buttonText}"}
          </button>
        </div>
      </div>
    </div>
  );
}
`.trim();
}

function generateButtonPaywall(params: any) {
  const { productPriceId, buttonText } = params;
  
  return `
"use client";

import { useState } from "react";

export function SubscribeButton() {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch("https://mclorable.com/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productPriceId: "${productPriceId}",
          appId: window.location.pathname.split("/")[2],
        }),
      });
      
      const data = await response.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? "Loading..." : "${buttonText}"}
    </button>
  );
}
`.trim();
}

function generateSubscriptionHook() {
  return `
"use client";

import { useState, useEffect } from "react";

export function useSubscription() {
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkSubscription = async () => {
    try {
      const appId = window.location.pathname.split("/")[2];
      const response = await fetch(\`https://mclorable.com/api/payments/subscription?appId=\${appId}\`);
      const data = await response.json();
      setHasActiveSubscription(data.hasActiveSubscription);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setHasActiveSubscription(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  return {
    hasActiveSubscription,
    loading,
    checkSubscription,
  };
}
`.trim();
}