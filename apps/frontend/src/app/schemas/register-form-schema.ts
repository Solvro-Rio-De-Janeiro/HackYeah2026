import { z } from "zod";

export const registerFormSchema = z
  .object({
    email: z.email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long"),
    repeatPassword: z.string().min(1, "Please confirm your password"),
    username: z
      .string()
      .min(1, "Username is required")
      .min(3, "Username must be at least 3 characters long")
      .max(20, "Username cannot exceed 20 characters")
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        "Username can only contain letters, numbers, underscores and hyphens",
      ),
    termsAccepted: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
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
    message: "Passwords do not match",
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
      message: "Please enter a valid card number",
      path: ["cardNumber"],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "card") {
        return /^(0[1-9]|1[0-2])\/\d{2}$/.test(data.cardExpiry || "");
      }
      return true;
    },
    {
      message: "Invalid expiration date (MM/YY)",
      path: ["cardExpiry"],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "card") {
        return /^\d{3,4}$/.test(data.cardCvc || "");
      }
      return true;
    },
    {
      message: "CVC must be 3 or 4 digits",
      path: ["cardCvc"],
    }
  )
  .refine(
    (data) => {
      if (data.paymentMethod === "card") {
        return (data.cardholderName || "").trim().length >= 2;
      }
      return true;
    },
    {
      message: "Cardholder name is required",
      path: ["cardholderName"],
    }
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
      message: "BLIK code must be 6 digits",
      path: ["blikCode"],
    }
  );

export type RegisterFormData = z.infer<typeof registerFormSchema>;
