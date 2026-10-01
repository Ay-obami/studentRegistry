import { ethers } from "ethers";

export function parseAddresses(text) {
  const addresses = text.split(/[\s,]+/).filter(Boolean);
  const invalidAddress = addresses.find((address) => !ethers.isAddress(address));

  if (invalidAddress) {
    throw new Error(`Invalid address: ${invalidAddress}`);
  }

  return addresses;
}

export function addUniqueAddresses(currentAddresses, newAddresses) {
  const knownAddresses = new Set(
    currentAddresses.map((address) => address.toLowerCase()),
  );
  const result = [...currentAddresses];

  for (const address of newAddresses) {
    const normalizedAddress = address.toLowerCase();

    if (!knownAddresses.has(normalizedAddress)) {
      knownAddresses.add(normalizedAddress);
      result.push(address);
    }
  }

  return result;
}
