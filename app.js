if (!window.isAppJsLoaded) {
    window.isAppJsLoaded = true;

    const SUPABASE_URL = 'https://yjgpvdxxmaslqxqllasi.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqZ3B2ZHh4bWFzbHF4cWxsYXNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxNTU1MzQsImV4cCI6MjA4MzczMTUzNH0.O8BAim9AICGKJSKsDIzgLBM_dGeQszmakwvR4IAMr44';

    // Check if Supabase library is loaded
    if (typeof window.supabase === 'undefined') {
        console.error('ERROR: Supabase library not loaded!');
        alert('Error: Unable to load Supabase library. Please check your internet connection and refresh the page.');
    } else {
        console.log('✓ Supabase library loaded successfully');
    }

    // Initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✓ Supabase client initialized');

    // ===== FORM SUBMISSION =====
    document.getElementById('orderForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('✓ Form submit event triggered');

        // Get form values
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const email = document.getElementById('email').value;
        const address = document.getElementById('address').value;
        const quantity = parseInt(document.getElementById('quantity').value);

        console.log('Form data:', { name, phone, email, address, quantity });

        // Get button and messages
        const submitButton = e.target.querySelector('button[type="submit"]');
        const successMessage = document.getElementById('success-message');
        const errorMessage = document.getElementById('error-message');

        // Hide messages
        successMessage.style.display = 'none';
        errorMessage.style.display = 'none';

        // Disable button
        submitButton.disabled = true;
        submitButton.textContent = 'Submitting...';

        try {
            console.log('📤 Attempting to insert order into Supabase...');

            // Insert order into Supabase
            const { data, error } = await supabase
                .from('orders')
                .insert([
                    {
                        name: name,
                        phone: phone,
                        email: email,
                        address: address,
                        quantity: quantity
                    }
                ])
                .select();

            console.log('📥 Supabase response:', { data, error });

            if (error) {
                console.error('❌ Supabase error:', error);
                throw error;
            }

            console.log('✅ Order inserted successfully!', data);

            // Show success message
            successMessage.style.display = 'flex';

            // Reset form
            e.target.reset();

            // Scroll to success message
            successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Hide success message after 5 seconds
            setTimeout(() => {
                successMessage.style.display = 'none';
            }, 5000);

        } catch (error) {
            console.error('❌ Error submitting order:', error);
            console.error('Error details:', {
                message: error.message,
                details: error.details,
                hint: error.hint,
                code: error.code
            });

            // Show detailed error message
            let errorText = 'Error: ';
            if (error.message) {
                errorText += error.message;
            } else {
                errorText += 'Something went wrong. Please try again.';
            }

            if (error.hint) {
                errorText += '\n\nHint: ' + error.hint;
            }

            // Check for common permission errors
            if (error.code === '42501' || (error.message && error.message.includes('permission'))) {
                errorText += '\n\n🔒 This is a permissions error. Please enable Row Level Security policies in Supabase.';
            }

            // Update error message text
            const errorTextElement = document.getElementById('error-text');
            if (errorTextElement) {
                errorTextElement.textContent = errorText;
            }

            errorMessage.style.display = 'flex';

            // Scroll to error message
            errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });

        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Submit Order';
        }
    });

    console.log('✓ Form event listener attached successfully');
}