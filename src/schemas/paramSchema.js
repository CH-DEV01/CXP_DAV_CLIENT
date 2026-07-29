import * as z from 'zod';

export const paramSchema = z.object({
    param_key: z
        .string()
        .min(1, { message: "La clave es obligatoria" })
        .max(50, { message: "La clave no puede tener más de 50 caracteres" }),

    param_value: z
        .string()
        .min(1, { message: "El valor es obligatorio" })
});