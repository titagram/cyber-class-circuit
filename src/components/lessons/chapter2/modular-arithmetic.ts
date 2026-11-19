export function residues(modulus: number) {
  return Array.from({ length: modulus }, (_, value) => value);
}

export function modulo(number: number, modulus: number) {
  const remainder = number % modulus;
  return remainder < 0 ? remainder + modulus : remainder || 0;
}

export function euclideanDivisions(a: number, b: number) {
  const divisions = [];

  while (b !== 0) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    divisions.push({ dividend: a, divisor: b, quotient, remainder });
    [a, b] = [b, remainder];
  }

  return divisions;
}

export function gcd(a: number, b: number) {
  return euclideanDivisions(a, b).at(-1)?.divisor ?? a;
}

export function modularPower(base: number, exponent: number, modulus: number) {
  const initial = { power: 0, previous: 1, residue: 1 };
  const trace = [initial];
  let result = initial.residue;

  for (let power = 1; power <= exponent; power++) {
    const previous = result;
    result = modulo(previous * base, modulus);
    trace.push({ power, previous, residue: result });
  }

  return { initial, trace, result };
}
