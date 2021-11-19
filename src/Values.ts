export type Value = "2" | "4" | "8" | "16" | "32" | "64" | "128" | "256" | "512" | "1024" | "2048";
export type Color = string;
export type MaybeValue = Value | null;

interface FullValue {
  value: Value;
  color: Color;
}

const FullValues: FullValue[] = [
  {
    value: "2",
    color: "226, 60, 0"
  },
  {
    value: "4",
    color: "255, 242, 74",
  },
  {
    value: "8",
    color: "80, 228, 228",
  },
  {
    value: "16",
    color: "131, 55, 183",
  },
  {
    value: "32",
    color: "53, 136, 86",
  },
  {
    value: "64",
    color: "185, 164, 239",
  },
  {
    value: "128",
    color: "228, 215, 163",
  },
  {
    value: "256",
    color: "120, 161, 163",
  },
  {
    value: "512",
    color: "165, 201, 241",
  },
  {
    value: "1024",
    color: "12, 56, 35"
  },
  {
    value: "2048",
    color: "162, 84, 212",
  },
];

export const Values = FullValues.map(function(fullValue) { return fullValue.value; });

export function getNextValue(value: Value, jump: number = 1): Value | null {
  // Don't let it go out of bounds
  const index = Math.min(
    Values.findIndex(function(curr) { return curr === value; }) + jump,
    Values.length - 1
  );
  return Values[index];
}
export function getValueColor(value: Value): Color {
  const maybeFullValue = FullValues.find(function(fullValue) { return fullValue.value === value; })
  return maybeFullValue == null ? "0, 0, 0" : maybeFullValue.color;
}