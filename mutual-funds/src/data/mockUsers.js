// Fixed users: admin has a specific real email/password
// New registered users are saved to localStorage by AuthContext
export const mockUsers = [
  { id: 1, name: 'Ravi Kumar',     email: 'ravi@example.com',                           password: 'pass',     role: 'investor' },
  { id: 2, name: 'Advisor Sharma', email: 'advisor@example.com',                         password: 'pass',     role: 'advisor'  },
  { id: 3, name: 'Analyst Gupta',  email: 'analyst@example.com',                         password: 'pass',     role: 'analyst'  },
  { id: 4, name: 'Abhiram Kotamarthy', email: 'abhiramkotamarthisubrahmanya@gmail.com',  password: 'Abhi@321', role: 'admin'    },
];
