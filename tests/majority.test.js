import { chipher } from "./../js/codec";
import { encode, decode } from "./../js/utils";

describe("recover tests", () => {
  const plaintext = "NASA_MARS";
  const iv = "58216150";
  const shift = 1;
  const alphabet =
    "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
  const sha = "b539474cb934ef";
  test("test: 0% errors on 5 channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet);
    const restoredText = chipher
      .decrypt(cipherText, iv, shift, alphabet)
      .join("");
    expect(restoredText).toBe(plaintext);
  });
  test("test: encrypt_plain and decrypt_plain", () => {
    const cipherText = chipher.encrypt_plain(plaintext, iv, shift, alphabet);
    const restoredText = chipher.decrypt_plain(cipherText, iv, shift, alphabet);
    expect([...restoredText].join("")).toBe(plaintext);
  });
  test("test: decode and encode", () => {
    const cipherText = chipher.encrypt(
      encode(plaintext, alphabet),
      iv,
      shift,
      alphabet,
    );
    const restoredText = decode(
      chipher.decrypt(cipherText, iv, shift, alphabet),
      alphabet,
    );
    expect(restoredText).toBe(plaintext);
  });
  test("test: decode and encode default alphabet", () => {
    const cipherText = encode(plaintext);
    const restoredText = decode(cipherText);
    expect(restoredText).toBe(plaintext);
  });
  test("test: 100% errors on 1 channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet);
    const partLength = Math.floor(cipherText.length / 5);
    const brokenCipherText = [
      ..."X".repeat(partLength),
      ...cipherText.slice(partLength),
    ];
    const restoredText = chipher
      .decrypt(brokenCipherText, iv, shift, alphabet)
      .join("");
    expect(restoredText).toBe(plaintext);
  });
  test("test: 100% errors on 2 channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet);
    const partLength = Math.floor(cipherText.length / 5);
    const badStream = "X".repeat(partLength);
    const brokenCipherText = [
      ...badStream,
      ...badStream,
      ...cipherText.slice(partLength * 2),
    ];
    const restoredText = chipher
      .decrypt(brokenCipherText, iv, shift, alphabet)
      .join("");
    expect([plaintext, "X".repeat(plaintext.length)]).toContain(restoredText);
  });
  test("test: 100% errors on 1 random channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet);
    const partLength = Math.floor(cipherText.length / 5);
    let channels = [
      [...cipherText.slice(0, partLength)],
      [...cipherText.slice(partLength, partLength * 2)],
      [...cipherText.slice(partLength * 2, partLength * 3)],
      [...cipherText.slice(partLength * 3, partLength * 4)],
      [...cipherText.slice(partLength * 4)],
    ];
    let visualMatrix = [["ch1"], ["ch2"], ["ch3"], ["ch4"], ["ch5"]];
    for (let i = 0; i < partLength; i++) {
      const randomChannelIdx = Math.floor(Math.random() * 5);
      let badChar = alphabet[Math.floor(Math.random() * alphabet.length)];
      channels[randomChannelIdx][i] = badChar;
      for (let c = 0; c < 5; c++) {
        visualMatrix[c].push(c === randomChannelIdx ? "x" : "o");
      }
    }
    console.table(visualMatrix);
    const brokenCipherText = channels.flatMap((ch) => ch);
    const restoredText = chipher
      .decrypt(brokenCipherText, iv, shift, alphabet)
      .join("");
    expect(restoredText).toBe(plaintext);
  });
  test("test: 100% errors on 2 random channel(s)", () => {
    const cipherText = chipher.encrypt(plaintext, iv, shift, alphabet);
    const partLength = Math.floor(cipherText.length / 5);
    let channels = [
      [...cipherText.slice(0, partLength)],
      [...cipherText.slice(partLength, partLength * 2)],
      [...cipherText.slice(partLength * 2, partLength * 3)],
      [...cipherText.slice(partLength * 3, partLength * 4)],
      [...cipherText.slice(partLength * 4)],
    ];
    let visualMatrix = [["ch1"], ["ch2"], ["ch3"], ["ch4"], ["ch5"]];
    for (let i = 0; i < partLength; i++) {
      const randomChannelIdx1 = Math.floor(Math.random() * 5);
      const randomChannelIdx2 = Math.floor(Math.random() * 5);
      let badChar1 = alphabet[Math.floor(Math.random() * alphabet.length)];
      let badChar2 = alphabet[Math.floor(Math.random() * alphabet.length)];
      channels[randomChannelIdx1][i] = badChar1;
      channels[randomChannelIdx2][i] = badChar2;
      for (let c = 0; c < 5; c++) {
        visualMatrix[c].push(
          c === randomChannelIdx1 || c === randomChannelIdx2 ? "x" : "o",
        );
      }
    }
    console.table(visualMatrix);
    const brokenCipherText = channels.flatMap((ch) => ch);
    const restoredText = chipher
      .decrypt(brokenCipherText, iv, shift, alphabet)
      .join("");
    expect(restoredText).toBe(plaintext);
  });
});
