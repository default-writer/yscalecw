import { encode, decode } from "../js/utils";

test("test: encode and decode test", () => {
  const text = `🍎🍏 The atmosphere of Mars is about 100 times thinner than Earth's, and it is 95 percent carbon dioxide.`;
  const bin_alphabet = "01";
  const bin_encoded = encode(text, bin_alphabet);
  console.log("binary view first 32 characters:", bin_encoded.slice(0, 32));
  const hex_alphabet = "0123456789ABCDEF";
  const hex_encoded = encode(text, hex_alphabet);
  console.log("hex view first 8 characters:", hex_encoded.slice(0, 8));
  console.log(
    "decoded binary matches:",
    decode(bin_encoded, bin_alphabet) === text,
  );
  console.log(
    "decoded hex matches:",
    decode(hex_encoded, hex_alphabet) === text,
  );
  expect(text).toBe(decode(bin_encoded, bin_alphabet));
  expect(text).toBe(decode(hex_encoded, hex_alphabet));
});
