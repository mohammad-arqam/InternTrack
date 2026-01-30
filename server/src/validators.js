import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(100),
});

export const appSchema = z.object({
  company: z.string().min(1).max(120),
  role: z.string().min(1).max(120),
  location: z.string().max(120).optional().default(""),
  status: z.enum(["Applied","Interview","Offer","Rejected","Ghosted","Accepted"]).optional().default("Applied"),
  url: z.string().max(400).optional().default(""),
  notes: z.string().max(5000).optional().default(""),
  applied_date: z.string().max(40).optional().default(""),
});
