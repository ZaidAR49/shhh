const otplib = require('otplib');

const secret = otplib.authenticator.generateSecret();
const token = otplib.authenticator.generate(secret);
console.log('Testing otplib.verify signature');
try {
  const result1 = otplib.verify({ token, secret });
  console.log('Result 1:', result1);
} catch(e) {
  console.error('1 failed', e.message);
}

try {
  const result2 = otplib.authenticator.verify({ token, secret });
  console.log('Result 2:', result2);
} catch(e) {
  console.error('2 failed', e.message);
}
