import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export interface ResolvedAddress {
  address: string;
  family: 4 | 6;
}

export type DnsResolver = (hostname: string) => Promise<readonly ResolvedAddress[]>;

export interface NetworkGuardOptions {
  allowLoopback?: boolean;
  requireHttpsForRemote?: boolean;
  resolver?: DnsResolver;
}

export interface ValidatedHttpTarget {
  url: URL;
  addresses: readonly ResolvedAddress[];
  isLoopback: boolean;
}

const defaultResolver: DnsResolver = async (hostname) => {
  const records = await lookup(hostname, { all: true, verbatim: true });
  return records.map((record) => ({
    address: record.address,
    family: record.family === 6 ? 6 : 4
  }));
};

function normalizeHostname(hostname: string): string {
  const value = hostname.toLowerCase();
  return value.startsWith("[") && value.endsWith("]") ? value.slice(1, -1) : value;
}

function ipv4ToInt(value: string): number {
  return value.split(".").reduce((acc, part) => ((acc << 8) | Number(part)) >>> 0, 0);
}

function inV4Range(value: number, base: string, prefix: number): boolean {
  const baseValue = ipv4ToInt(base);
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0;
  return (value & mask) === (baseValue & mask);
}

export function isGlobalIp(address: string): boolean {
  const normalizedAddress = normalizeHostname(address);
  const family = isIP(normalizedAddress);

  if (family === 4) {
    const value = ipv4ToInt(normalizedAddress);
    const blocked: Array<[string, number]> = [
      ["0.0.0.0", 8],
      ["10.0.0.0", 8],
      ["100.64.0.0", 10],
      ["127.0.0.0", 8],
      ["169.254.0.0", 16],
      ["172.16.0.0", 12],
      ["192.0.0.0", 24],
      ["192.0.2.0", 24],
      ["192.168.0.0", 16],
      ["198.18.0.0", 15],
      ["198.51.100.0", 24],
      ["203.0.113.0", 24],
      ["224.0.0.0", 4],
      ["240.0.0.0", 4]
    ];
    return !blocked.some(([base, prefix]) => inV4Range(value, base, prefix));
  }

  if (family === 6) {
    const value = normalizedAddress.toLowerCase();
    if (value === "::" || value === "::1") return false;
    if (value.startsWith("fc") || value.startsWith("fd")) return false;
    if (/^fe[89ab]/.test(value)) return false;
    if (value.startsWith("ff")) return false;
    if (value.startsWith("2001:db8:") || value === "2001:db8::") return false;
    if (value.startsWith("::ffff:")) {
      const mapped = value.slice("::ffff:".length);
      return isIP(mapped) === 4 && isGlobalIp(mapped);
    }
    return true;
  }

  return false;
}

function isLoopbackIp(address: string): boolean {
  const normalizedAddress = normalizeHostname(address);
  if (normalizedAddress === "::1") return true;
  if (isIP(normalizedAddress) !== 4) return false;
  return inV4Range(ipv4ToInt(normalizedAddress), "127.0.0.0", 8);
}

export async function validateHttpTarget(
  rawUrl: string,
  options: NetworkGuardOptions = {}
): Promise<ValidatedHttpTarget> {
  const value = rawUrl.trim();
  if (!value) throw new Error("URL is required.");

  const url = new URL(value);
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Only HTTP(S) URLs are allowed.");
  }
  if (url.username || url.password) {
    throw new Error("Credentials in URLs are not allowed.");
  }

  const hostname = normalizeHostname(url.hostname);
  const explicitLoopback = hostname === "localhost" || isLoopbackIp(hostname);
  const resolver = options.resolver ?? defaultResolver;
  const literalFamily = isIP(hostname);
  const addresses: readonly ResolvedAddress[] = literalFamily
    ? [{ address: hostname, family: literalFamily as 4 | 6 }]
    : await resolver(hostname);

  if (addresses.length === 0) throw new Error("DNS resolution returned no addresses.");

  if (explicitLoopback && options.allowLoopback === true) {
    if (addresses.some((entry) => !isLoopbackIp(entry.address))) {
      throw new Error("Loopback hostname resolved to a non-loopback address.");
    }
    return { url, addresses, isLoopback: true };
  }

  if (addresses.some((entry) => !isGlobalIp(entry.address))) {
    throw new Error("Private, loopback, link-local, reserved, or documentation addresses are blocked.");
  }

  if (options.requireHttpsForRemote === true && url.protocol !== "https:") {
    throw new Error("Remote targets must use HTTPS.");
  }

  return { url, addresses, isLoopback: false };
}
