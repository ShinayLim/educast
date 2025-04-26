async function testLogin(username, password) {
  try {
    console.log(`Logging in as ${username}...`);
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (loginResponse.ok) {
      const userData = await loginResponse.json();
      console.log(`Login successful for ${username}:`, userData);
    } else {
      console.error(`Login failed for ${username}:`, await loginResponse.text());
    }
  } catch (error) {
    console.error(`Error testing login for ${username}:`, error);
  }
}

// Run both tests
async function runTests() {
  // Test professor login
  await testLogin('professor', 'password123');
  
  // Test student login
  await testLogin('student', 'password123');
  
  console.log('Login tests completed.');
}

// Execute tests
runTests();