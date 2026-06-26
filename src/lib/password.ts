export interface PasswordOptions {
  length: number;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  special: boolean;
}

export function generatePassword(options: PasswordOptions): string {
  const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
  const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numberChars = '0123456789';
  const specialChars = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

  let allowedChars = '';
  if (options.lowercase) allowedChars += lowercaseChars;
  if (options.uppercase) allowedChars += uppercaseChars;
  if (options.numbers) allowedChars += numberChars;
  if (options.special) allowedChars += specialChars;

  if (allowedChars.length === 0) {
    // Fallback if user unchecks all
    allowedChars = lowercaseChars + uppercaseChars + numberChars;
  }

  const array = new Uint32Array(options.length);
  window.crypto.getRandomValues(array);

  let password = '';
  for (let i = 0; i < options.length; i++) {
    password += allowedChars[array[i] % allowedChars.length];
  }

  // Ensure at least one character from each selected set is included
  const requiredChars: string[] = [];
  if (options.lowercase) requiredChars.push(lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)]);
  if (options.uppercase) requiredChars.push(uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)]);
  if (options.numbers) requiredChars.push(numberChars[Math.floor(Math.random() * numberChars.length)]);
  if (options.special) requiredChars.push(specialChars[Math.floor(Math.random() * specialChars.length)]);

  if (requiredChars.length > 0 && options.length >= requiredChars.length) {
    const passwordArray = password.split('');
    for (let i = 0; i < requiredChars.length; i++) {
      passwordArray[i] = requiredChars[i];
    }
    // Shuffle the array to distribute required chars randomly
    for (let i = passwordArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [passwordArray[i], passwordArray[j]] = [passwordArray[j], passwordArray[i]];
    }
    password = passwordArray.join('');
  }

  return password;
}
