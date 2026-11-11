/**
 * Client-Side Razorpay Payment Gateway Integration
 */

export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }

    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }

    // Check if script tag is already being loaded
    const existingScript = document.getElementById("razorpay-checkout-js");
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.id = "razorpay-checkout-js";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay Checkout SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

export interface RazorpayCheckoutOptions {
  key?: string;
  orderId: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onError?: (error: any) => void;
  onDismiss?: () => void;
}

export async function launchRazorpayModal(opts: RazorpayCheckoutOptions): Promise<boolean> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    alert("Unable to open Razorpay payment gateway. Please check your internet connection.");
    return false;
  }

  const razorpayKey = opts.key || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_TymkbKigVMfger";

  const options = {
    key: razorpayKey,
    amount: opts.amount,
    currency: opts.currency || "INR",
    name: opts.name || "Shri Ram Janmabhoomi & Mahadev Mandir",
    description: opts.description || "Temple Digital Contribution",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=80",
    order_id: opts.orderId,
    handler: function (response: any) {
      opts.onSuccess(response);
    },
    prefill: {
      name: opts.prefill?.name || "",
      email: opts.prefill?.email || "",
      contact: opts.prefill?.contact || "",
    },
    theme: {
      color: "#7B1113",
    },
    modal: {
      ondismiss: function () {
        if (opts.onDismiss) opts.onDismiss();
      },
    },
  };

  const rzp = new (window as any).Razorpay(options);
  rzp.on("payment.failed", function (response: any) {
    if (opts.onError) opts.onError(response.error);
    else alert(`Payment Failed: ${response.error?.description || "Transaction rejected"}`);
  });

  rzp.open();
  return true;
}
