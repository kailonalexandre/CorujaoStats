import { z } from "zod";

export function emptyStringToUndefined(value: unknown) {
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }

  return value;
}

export function optionalUrl(message = "Informe uma URL valida.") {
  return z.preprocess(
    emptyStringToUndefined,
    z.string().trim().url(message).optional(),
  );
}

export function optionalNonNegativeInt(label: string) {
  return z.preprocess(
    emptyStringToUndefined,
    z
      .coerce
      .number({ error: `${label} deve ser um numero.` })
      .int(`${label} deve ser um numero inteiro.`)
      .min(0, `${label} nao pode ser negativo.`)
      .optional(),
  );
}
