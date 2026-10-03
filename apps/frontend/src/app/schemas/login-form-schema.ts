import { z } from "zod";

export const loginFormSchema = z.object({
  email: z.email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters long"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginFormSchema>;
