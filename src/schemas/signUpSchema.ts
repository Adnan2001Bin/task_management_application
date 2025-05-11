import { z } from "zod";

export const usernameValidation = z
  .string()
  .min(2, "Username must be at least 2 characters")
  .max(20, "Username must be no more than 20 characters")
  .regex(/^[a-zA-Z0-9_]+$/, "Username must not contain special characters");

export const signUpSchema = z.object({
  name: usernameValidation,

  email: z.string().email({ message: "Invalid email address" })
  .max(255, { message: "Email must be no more than 255 characters" })
  .refine((val) => val.trim() !== "", { message: "Email cannot be empty" }), 

  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" })
    .max(128, { message: "Password must be no more than 128 characters" })
    .regex(/[A-Za-z]/, { message: "Password must contain at least one letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
