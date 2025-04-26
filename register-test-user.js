// Using built-in fetch (Node.js 18+)
async function registerTestUser() {
  try {
    // Professor user
    console.log('Registering professor user...');
    const professorResponse = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'professor',
        password: 'password123',
        email: 'professor@example.com',
        fullName: 'Professor Smith',
        role: 'professor',
      }),
    });

    const professorData = await professorResponse.json();
    console.log('Professor registration response:', professorData);

    // Student user
    console.log('Registering student user...');
    const studentResponse = await fetch('http://localhost:5000/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'student',
        password: 'password123',
        email: 'student@example.com',
        fullName: 'Student Jones',
        role: 'student',
      }),
    });

    const studentData = await studentResponse.json();
    console.log('Student registration response:', studentData);
  } catch (error) {
    console.error('Error registering test users:', error);
  }
}

registerTestUser();