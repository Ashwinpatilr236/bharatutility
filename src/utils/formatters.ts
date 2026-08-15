
/**
 * Formats a number to the Indian numbering system (e.g. 25,00,000)
 */
export function formatIndianNumber(num: number | string, decimals: number = 0): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n)) return '0';

  const parts = n.toFixed(decimals).split('.');
  let integerPart = parts[0];
  const decimalPart = parts.length > 1 && decimals > 0 ? `.${parts[1]}` : '';

  const isNegative = integerPart.startsWith('-');
  if (isNegative) {
    integerPart = integerPart.substring(1);
  }

  if (integerPart.length <= 3) {
    return (isNegative ? '-' : '') + integerPart + decimalPart;
  }

  const lastThree = integerPart.substring(integerPart.length - 3);
  const otherNumbers = integerPart.substring(0, integerPart.length - 3);
  const formattedOthers = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',');

  return (isNegative ? '-' : '') + formattedOthers + ',' + lastThree + decimalPart;
}

/**
 * Formats a currency value with Rupee symbol and Indian comma separators
 */
export function formatINR(num: number | string, decimals: number = 0): string {
  return `₹${formatIndianNumber(num, decimals)}`;
}

/**
 * Formats large Indian numbers in compact word form (Lakh, Crore, K)
 */
export function formatIndianCompact(num: number): string {
  if (isNaN(num) || num === 0) return '₹0';
  const abs = Math.abs(num);
  const sign = num < 0 ? '-' : '';

  if (abs >= 10000000) {
    const cr = abs / 10000000;
    return `${sign}₹${cr.toFixed(cr >= 10 ? 1 : 2)} Cr`;
  }
  if (abs >= 100000) {
    const lk = abs / 100000;
    return `${sign}₹${lk.toFixed(lk >= 10 ? 1 : 2)} Lakh`;
  }
  if (abs >= 1000) {
    const k = abs / 1000;
    return `${sign}₹${k.toFixed(1)} K`;
  }
  return `${sign}₹${formatIndianNumber(abs)}`;
}

/**
 * Convert number into Indian words (e.g., 2500000 -> Twenty Five Lakh Rupees)
 */
export function numberToIndianWords(num: number): string {
  if (isNaN(num) || num === 0) return 'Zero Rupees';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function numToWords(n: number): string {
    let str = '';
    if (n > 19) {
      str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
    } else {
      str += a[n];
    }
    return str;
  }

  let n = Math.floor(Math.abs(num));
  let output = '';

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  const hundred = Math.floor(n / 100);
  n %= 100;

  if (crore > 0) {
    output += numToWords(crore) + 'Crore ';
  }
  if (lakh > 0) {
    output += numToWords(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    output += numToWords(thousand) + 'Thousand ';
  }
  if (hundred > 0) {
    output += numToWords(hundred) + 'Hundred ';
  }
  if (n > 0) {
    output += (output !== '' ? 'and ' : '') + numToWords(n);
  }

  return (output.trim() + ' Rupees').replace(/\s+/g, ' ');
}

/**
 * Triggers a subtle success celebratory burst
 */
export async function triggerCelebration() {
  try {
    const confetti = (await import('canvas-confetti')).default;
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Ignore if not supported
  }
}

/**
 * Copy text to clipboard with fallback
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const success = document.execCommand('copy');
    document.body.removeChild(textArea);
    return success;
  } catch {
    return false;
  }
}
