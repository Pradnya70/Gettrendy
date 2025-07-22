/**
 * Loads the Razorpay script dynamically
 * @returns {Promise<boolean>} Returns true if loaded successfully
 */
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export default loadRazorpay;
