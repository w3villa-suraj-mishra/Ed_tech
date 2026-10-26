import toast from 'react-hot-toast';

export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const openRazorpayCheckout = async ({
  orderId,
  amount,
  currency = 'INR',
  keyId,
  customerDetails,
  onSuccess,
  onFailure,
  onDismiss
}) => {
  const isScriptLoaded = await loadRazorpayScript();

  if (!isScriptLoaded || !window.Razorpay) {
    toast.error('Razorpay SDK failed to load. Please check your internet connection.');
    if (onFailure) onFailure(new Error('Razorpay SDK failed to load'));
    return;
  }

  const options = {
    key: keyId || 'rzp_test_51M00000000000',
    amount: amount, // amount in paise
    currency: currency,
    name: 'EdTech Platform',
    description: 'Course Access Purchase',
    image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    order_id: orderId,
    prefill: {
      name: customerDetails?.name || '',
      email: customerDetails?.email || '',
      contact: customerDetails?.phone || '',
    },
    theme: {
      color: '#7C3AED', // Purple matching existing app theme
    },
    handler: function (response) {
      // response: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
      if (onSuccess) {
        onSuccess(response);
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      },
    },
  };

  try {
    const razorpayWindow = new window.Razorpay(options);
    razorpayWindow.on('payment.failed', function (response) {
      if (onFailure) {
        onFailure(response.error || new Error('Payment failed'));
      }
    });
    razorpayWindow.open();
  } catch (err) {
    console.error('Error opening Razorpay modal:', err);
    if (onFailure) onFailure(err);
  }
};
