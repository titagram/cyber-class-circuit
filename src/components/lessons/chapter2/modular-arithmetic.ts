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

export function extendedEuclid(a: number, b: number) {
  const divisions = euclideanDivisions(a, b);
  let previous = { first: 1, second: 0 };
  let current = { first: 0, second: 1 };
  const trace = divisions.map((division) => {
    const next = {
      first: previous.first - division.quotient * current.first,
      second: previous.second - division.quotient * current.second,
    };
    [previous, current] = [current, next];
    return { ...division, ...next };
  });
  return { ...previous, divisor: divisions.at(-1)?.divisor ?? a, trace };
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
