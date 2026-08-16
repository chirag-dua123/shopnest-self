async function runTests() {
  const baseUrl = 'http://localhost:5000/api';
  let cookieStr = '';

  const headers = {
    'Content-Type': 'application/json',
  };

  try {
    console.log('1. Testing Login as Test User (Expected to fail due to unverified email)...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: 'test@example.com', password: 'User@123' })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', loginRes.status, loginData);

    console.log('\n2. Testing OTP Verification (123456)...');
    const otpRes = await fetch(`${baseUrl}/auth/verify-otp`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email: 'test@example.com', otp: '123456' })
    });
    const otpData = await otpRes.json();
    console.log('OTP Verify Response:', otpRes.status, otpData);
    
    // Extract cookies from Set-Cookie headers. 
    // Node.js fetch implementation exposes raw headers.
    const rawSetCookie = otpRes.headers.raw && otpRes.headers.raw()['set-cookie'];
    if (rawSetCookie) {
      cookieStr = rawSetCookie.map(c => c.split(';')[0]).join('; ');
      headers['Cookie'] = cookieStr;
      console.log('Captured Cookies:', cookieStr);
    } else {
        // Fallback for node 18+ web fetch API
        const setCookie = otpRes.headers.get('set-cookie');
        if (setCookie) {
            cookieStr = setCookie; // Note: if multiple cookies, get() merges them but not perfectly.
            headers['Cookie'] = cookieStr;
            console.log('Captured Cookies:', cookieStr);
        }
    }

    console.log('\n3. Fetching Products...');
    const prodRes = await fetch(`${baseUrl}/products`);
    const prodData = await prodRes.json();
    console.log(`Found ${prodData.total} products.`);
    const firstProduct = prodData.products && prodData.products[0];

    if (firstProduct) {
      console.log('\n4. Adding to Cart (Requires Auth)...');
      const cartRes = await fetch(`${baseUrl}/cart`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ productId: firstProduct._id, quantity: 2 })
      });
      const cartData = await cartRes.json();
      console.log('Cart Items count:', cartData.items ? cartData.items.length : cartData);

      console.log('\n5. Creating Order (Requires Auth)...');
      const orderRes = await fetch(`${baseUrl}/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderItems: [{ product: firstProduct._id, quantity: 2 }],
          shippingAddress: { address: '123 Test St', city: 'Testville', postalCode: '12345', country: 'Testland' },
          paymentMethod: 'Razorpay'
        })
      });
      const orderData = await orderRes.json();
      console.log('Order created with ID:', orderData._id, 'Total Price:', orderData.totalPrice);
    }
    
    console.log('\n--- ALL TESTS COMPLETED ---');
  } catch (err) {
    console.error('Test script failed:', err);
  }
}

runTests();
