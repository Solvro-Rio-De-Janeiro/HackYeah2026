import { z } from "zod";

export const registerFormSchema = z
  .object({
    email: z.email({ message: "Wprowadź poprawny adres e-mail" }),
    password: z
      .string()
      .min(1, "Hasło jest wymagane")
      .min(8, "Hasło musi mieć co najmniej 8 znaków"),
    repeatPassword: z.string().min(1, "Potwierdź hasło"),
    username: z
      .string()
      .min(1, "Nazwa użytkownika jest wymagana")
      .min(3, "Nazwa użytkownika musi mieć co najmniej 3 znaki")
      .max(20, "Nazwa użytkownika nie może przekraczać 20 znaków")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Nazwa użytkownika może zawierać tylko litery, cyfry, podkreślenia i myślniki",
      ),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "Musisz zaakceptować regulamin",
    }),
    paymentMethod: z.enum(["card", "blik"]).default("card"),
    cardNumber: z.string().optional(),
    cardExpiry: z.string().optional(),
    cardCvc: z.string().optional(),
    cardholderName: z.string().optional(),
    postalCode: z.string().optional(),
    blikCode: z.string().optional(),
  })
  .refine((data) => data.password === data.repeatPassword, {
    message: "Hasła nie są zgodne",
    path: ["repeatPassword"],
  })
  .refine(
    (data) => {
      if (data.paymentMethod === "card") {
        const raw = (data.cardNumber || "").replace(/\s/g, "");
        return raw.length >= 15 && raw.length <= 19;
      }
      return true;
    },
    {
      message: "Wprowadź poprawny numer karty",
      path: ["cardNumber"],
    },
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "card") {
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry || "");
      }
      return true;
    },
    {
      message: "Nieprawidłowa data ważności (MM/RR)",
      path: ["cardExpiry"],
    },
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "card") {
        return /^\d{3,4}$/.test(data.cardCvc || "");
      }
      return true;
    },
    {
      message: "CVC musi składać się z 3 lub 4 cyfr",
      path: ["cardCvc"],
    },
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "card") {
        return (data.cardholderName || "").trim().length >= 2;
      }
      return true;
    },
    {
      message: "Imię i nazwisko właściciela karty jest wymagane",
      path: ["cardholderName"],
    },
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "blik") {
        const raw = (data.blikCode || "").replace(/\s/g, "");
        return /^\d{6}$/.test(raw);
      }
      return true;
    },
    {
      message: "Kod BLIK musi składać się z 6 cyfr",
      path: ["blikCode"],
    },
  );

export type RegisterFormData = z.infer<typeof registerFormSchema>;
