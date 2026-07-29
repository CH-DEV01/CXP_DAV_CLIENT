import * as z from 'zod';

export const holidaySchema = z.object({
    // 1. Validación de la fecha
    holidayDate: z
        .string()
        .min(1, { message: "La fecha del día feriado es obligatoria" }),

    // 2. Validación de la descripción
    description: z
        .string()
        .min(1, { message: "La descripción es obligatoria" })
        .min(6, { message: "La descripción debe tener al menos 6 caracteres" })
        .max(150, { message: "La descripción no puede exceder los 150 caracteres" })
});