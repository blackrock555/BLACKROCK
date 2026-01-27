/**
 * Wallet Address Validation
 * Validates cryptocurrency wallet addresses for supported networks
 */

// ERC-20 (Ethereum) and BEP-20 (BSC) addresses use the same format
const ETH_ADDRESS_REGEX = /^0x[a-fA-F0-9]{40}$/;

// TRC-20 (Tron) addresses start with 'T' and are base58
const TRON_ADDRESS_REGEX = /^T[a-zA-HJ-NP-Z1-9]{33}$/;

/**
 * Validates an Ethereum/BSC (ERC-20/BEP-20) address
 */
export function isValidEthAddress(address: string): boolean {
  if (!address) return false;
  return ETH_ADDRESS_REGEX.test(address);
}

/**
 * Validates a Tron (TRC-20) address
 */
export function isValidTronAddress(address: string): boolean {
  if (!address) return false;
  return TRON_ADDRESS_REGEX.test(address);
}

/**
 * Validates a wallet address for the specified network
 */
export function isValidWalletAddress(address: string, network: string): boolean {
  if (!address || !network) return false;

  const normalizedNetwork = network.toUpperCase();

  switch (normalizedNetwork) {
    case 'ERC20':
    case 'BEP20':
      return isValidEthAddress(address);
    case 'TRC20':
      return isValidTronAddress(address);
    default:
      return false;
  }
}

/**
 * Gets the expected address format description for a network
 */
export function getAddressFormatDescription(network: string): string {
  const normalizedNetwork = network.toUpperCase();

  switch (normalizedNetwork) {
    case 'ERC20':
      return 'ERC-20 address must start with 0x followed by 40 hexadecimal characters';
    case 'BEP20':
      return 'BEP-20 address must start with 0x followed by 40 hexadecimal characters';
    case 'TRC20':
      return 'TRC-20 address must start with T followed by 33 alphanumeric characters';
    default:
      return 'Invalid network';
  }
}

/**
 * Sanitizes a wallet address (removes whitespace, validates format)
 */
export function sanitizeWalletAddress(address: string): string {
  if (!address) return '';
  return address.trim();
}

/**
 * Validates and returns details about a wallet address
 */
export function validateWalletAddress(
  address: string,
  network: string
): { valid: boolean; error?: string; sanitized?: string } {
  const sanitized = sanitizeWalletAddress(address);

  if (!sanitized) {
    return { valid: false, error: 'Wallet address is required' };
  }

  if (!isValidWalletAddress(sanitized, network)) {
    return {
      valid: false,
      error: `Invalid wallet address. ${getAddressFormatDescription(network)}`,
    };
  }

  return { valid: true, sanitized };
}
