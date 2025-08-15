// Test script to verify user creation works
const request = require('http');

// Test data - matches frontend RegisterRequest interface
const testUser = {
    username: 'testuser123',
    email: 'test123@example.com',
    password: 'password123'
};

function testCreateUser() {
    const postData = JSON.stringify(testUser);
    
    const options = {
        hostname: 'localhost',
        port: 3000, // Adjust port if needed
        path: '/api/users',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
        }
    };

    console.log('Testing user creation...');
    console.log('Request data:', testUser);
    
    const req = request.request(options, (res) => {
        console.log(`\nResponse status: ${res.statusCode}`);
        console.log(`Response headers:`, res.headers);
        
        let responseData = '';
        
        res.on('data', (chunk) => {
            responseData += chunk;
        });
        
        res.on('end', () => {
            console.log('\nResponse body:', responseData);
            
            if (res.statusCode === 201) {
                console.log('✅ User creation successful!');
                try {
                    const parsedData = JSON.parse(responseData);
                    console.log('Created user data:', parsedData);
                } catch (e) {
                    console.log('Could not parse response as JSON');
                }
            } else {
                console.log('❌ User creation failed');
                try {
                    const parsedData = JSON.parse(responseData);
                    console.log('Error details:', parsedData);
                } catch (e) {
                    console.log('Error response (raw):', responseData);
                }
            }
        });
    });

    req.on('error', (e) => {
        console.error('❌ Request failed:', e.message);
        console.log('Make sure the server is running on localhost:3000');
    });

    req.write(postData);
    req.end();
}

// Add a simple timeout to allow checking if server is running
setTimeout(() => {
    testCreateUser();
}, 1000);

console.log('Starting user creation test...');
console.log('Note: Make sure the backend server is running on port 3000');