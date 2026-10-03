import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.email({ message: "Wprowadź poprawny adres e-mail" }),
  password: z
    .string()
    .min(1, "Hasło jest wymagane")
    .min(8, "Hasło musi mieć co najmniej 8 znaków"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
