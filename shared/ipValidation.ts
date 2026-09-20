export function isValidIpOrCidr(value: string): boolean {
  const [address, prefix] = value.trim().split('/');
  const octets = address.split('.');
  const validIpv4 = octets.length === 4 && octets.every(octet => {
    const number = Number(octet);
    return /^\d{1,3}$/.test(octet) && number >= 0 && number <= 255;
  });

  if (!validIpv4) return false;
  if (prefix === undefined) return true;
  const prefixNumber = Number(prefix);
  return /^\d{1,2}$/.test(prefix) && prefixNumber >= 0 && prefixNumber <= 32;
}
