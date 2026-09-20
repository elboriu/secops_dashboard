import { describe, expect, it } from "vitest";
import { isValidIpOrCidr } from "../shared/ipValidation";

describe("IP access list validation", () => {
  it("accepts IPv4 addresses and CIDR ranges", () => {
    expect(isValidIpOrCidr("203.45.67.89")).toBe(true);
    expect(isValidIpOrCidr("192.168.1.0/24")).toBe(true);
    expect(isValidIpOrCidr("0.0.0.0/0")).toBe(true);
    expect(isValidIpOrCidr("255.255.255.255/32")).toBe(true);
  });

  it("rejects malformed addresses and prefixes", () => {
    expect(isValidIpOrCidr("256.1.1.1")).toBe(false);
    expect(isValidIpOrCidr("192.168.1")).toBe(false);
    expect(isValidIpOrCidr("192.168.1.1/33")).toBe(false);
    expect(isValidIpOrCidr("192.168.1.1/-1")).toBe(false);
    expect(isValidIpOrCidr("not-an-ip")).toBe(false);
  });

  it("trims user input before validation", () => {
    expect(isValidIpOrCidr(" 10.0.0.50 ")).toBe(true);
    expect(isValidIpOrCidr(" 10.0.0.0/16 ")).toBe(true);
  });
});
