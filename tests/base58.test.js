import { encode_base58, decode_base58 } from "../js/base58";
import { sha1 } from "../js/sha1";
import { bytesToHex } from "../js/sha256";

const te = new TextEncoder();
const td = new TextDecoder();

const hex = (input) => bytesToHex(sha1(input));

describe("bsic sanity checks", () => {
  test("test: encode and decode test", () => {
    const text = `🍎🍏 The atmosphere of Mars is about 100 times thinner than Earth's, and it is 95 percent carbon dioxide.`;
    const bytes = te.encode(text); // Uint8Array
    const encoded = encode_base58(bytes); // Base58 with SHA-1 checksum
    console.log("base58 (first 32):", encoded.slice(0, 32));
    const decodedBytes = decode_base58(encoded, sha1(text)); // Uint8Array
    const decodedText = td.decode(decodedBytes);
    expect(decodedText).toBe(text);
  });

  test("test: sanity check", () => {
    const payload = Uint8Array.from([
      0x00, 0x01, 0x09, 0x66, 0x77, 0x60, 0x06, 0x95, 0x3d, 0x55, 0x67, 0x43,
      0x9e, 0x5e, 0x39, 0xf8, 0x6a, 0x0d, 0x27, 0x3b, 0xee,
    ]);
    const addr = encode_base58(payload);
    expect(addr).toBe("16UwLL9Risc3QfPqBUvKofHmBQ7wMtjvM");
  });
});

describe("SHA-1 known-answer tests (FIPS 180-4)", () => {
  test("empty message", () => {
    // FIPS 180-4, Appendix A.1
    expect(hex("")).toBe("da39a3ee5e6b4b0d3255bfef95601890afd80709");
  });

  test('"abc" — the standard one-block example', () => {
    // FIPS 180-4, Appendix A.2
    expect(hex("abc")).toBe("a9993e364706816aba3e25717850c26c9cd0d89d");
  });

  test("448-bit message — multi-block padding boundary", () => {
    // FIPS 180-4, Appendix A.3
    expect(
      hex("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"),
    ).toBe("84983e441c3bd26ebaae4aa1f95129e5e54670f1");
  });

  test("one million 'a' characters", () => {
    // FIPS 180-4, Appendix A.4
    expect(hex("a".repeat(1_000_000))).toBe(
      "34aa973cd4c4daa4f61eeb2bdbad27316534016f",
    );
  });

  test("returns a 20-byte Uint8Array", () => {
    const d = sha1("abc");
    expect(d).toBeInstanceOf(Uint8Array);
    expect(d.length).toBe(20);
  });
});
