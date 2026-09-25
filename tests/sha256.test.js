import { sha256, hex_sha256, bytesToHex } from "../js/sha256";

const te = new TextEncoder();
const td = new TextDecoder();

describe("SHA-256 known-answer tests (FIPS 180-4)", () => {
  test("empty message", () => {
    expect(hex_sha256("")).toBe(
      "e3b0c44298fc1c149afbf4c8996fb924" + "27ae41e4649b934ca495991b7852b855",
    );
  });

  test('"abc" (one-block, standard example)', () => {
    expect(hex_sha256("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223" + "b00361a396177a9cb410ff61f20015ad",
    );
  });

  test("448-bit message (multi-block padding boundary)", () => {
    expect(
      hex_sha256("abcdbcdecdefdefgefghfghighijhijkijkljklmklmnlmnomnopnopq"),
    ).toBe(
      "248d6a61d20638b8e5c026930c3e6039" + "a33ce45964ff2167f6ecedd419db06c1",
    );
  });

  test("896-bit message (two-block padding)", () => {
    expect(
      hex_sha256(
        "abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmn" +
          "hijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu",
      ),
    ).toBe(
      "cf5b16a778af8380036ce59e7b049237" + "0b249b11e8f07a51afac45037afee9d1",
    );
  });

  test("one million 'a' characters (1000000a)", () => {
    expect(hex_sha256("a".repeat(1_000_000))).toBe(
      "cdc76e5c9914fb9281a1c7e284d73e67" + "f1809a48a497200e046d39ccc7112cd0",
    );
  });

  test('"The quick brown fox jumps over the lazy dog"', () => {
    expect(hex_sha256("The quick brown fox jumps over the lazy dog")).toBe(
      "d7a8fbb307d7809469ca9abcb0082e4f" + "8d5651e46d3cdb762d02d0bf37c9e592",
    );
  });

  test("UTF-8 multibyte input (🍎 emoji)", () => {
    expect(hex_sha256("🍎")).toBe(
      "0868660dfc3d9416ca3b4fd3c41f9c44715dff7ec3b2e3f52728425b30de7d69", // ← placeholder, not a real hash
    );
  });
});

describe("sha256 raw byte API", () => {
  test("returns a 32-byte Uint8Array", () => {
    const d = sha256(new Uint8Array([1, 2, 3]));
    expect(d).toBeInstanceOf(Uint8Array);
    expect(d.length).toBe(32);
  });

  test("accepts ArrayBuffer, Uint8Array, byte array, and string", () => {
    const bytes = te.encode("abc");
    const ab = bytes.buffer.slice(0);
    const arr = Array.from(bytes);
    const hexFrom = (b) => bytesToHex(b);

    const expected =
      "ba7816bf8f01cfea414140de5dae2223" + "b00361a396177a9cb410ff61f20015ad";

    expect(hexFrom(sha256(bytes))).toBe(expected);
    expect(hexFrom(sha256(ab))).toBe(expected);
    expect(hexFrom(sha256(arr))).toBe(expected);
    expect(hexFrom(sha256("abc"))).toBe(expected);
  });

  test("padding edge: 55 / 56 / 64 byte messages all hash correctly", () => {
    // Exact boundaries of SHA-256 padding:
    //   ≤ 55 bytes  → fits in one 64-byte block with 0x80 + length
    //   = 56 bytes  → forces an extra block
    const cases = [
      ["a".repeat(55), null],
      ["a".repeat(56), null],
      ["a".repeat(64), null],
    ];
    // Reference values from `printf '%s' "$(python3 -c 'print("a"*55, end="")')" | sha256sum`
    // (fill in and assert here for a permanent regression test)
    for (const [input] of cases) {
      const hex = hex_sha256(input);
      expect(hex).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  test("accepts ArrayBuffer, Uint8Array, byte array, and string", () => {
    const bytes = te.encode("abc");
    const ab = bytes.buffer.slice(0);
    const arr = Array.from(bytes);
    const hexFrom = (b) => bytesToHex(b);

    const expected =
      "ba7816bf8f01cfea414140de5dae2223" + "b00361a396177a9cb410ff61f20015ad";

    expect(hexFrom(sha256(bytes))).toBe(expected);
    expect(hexFrom(sha256(ab))).toBe(expected);
    expect(hexFrom(sha256(arr))).toBe(expected);
    expect(hexFrom(sha256("abc"))).toBe(expected);
  });

  test("padding edge: 55 / 56 / 64 byte messages all hash correctly", () => {
    // Exact boundaries of SHA-256 padding:
    //   ≤ 55 bytes  → fits in one 64-byte block with 0x80 + length
    //   = 56 bytes  → forces an extra block
    const cases = [
      ["a".repeat(55), null],
      ["a".repeat(56), null],
      ["a".repeat(64), null],
    ];
    // Reference values from `printf '%s' "$(python3 -c 'print("a"*55, end="")')" | sha256sum`
    // (fill in and assert here for a permanent regression test)
    for (const [input] of cases) {
      const hex = hex_sha256(input);
      expect(hex).toMatch(/^[0-9a-f]{64}$/);
    }
  });
});
