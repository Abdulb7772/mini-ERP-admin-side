"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { signIn } from "next-auth/react";
import toast from "react-hot-toast";
import Input from "@/components/Input";
import Button from "@/components/Button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string()
      .min(2, "Name must be at least 2 characters")
      .required("Name is required"),
    email: Yup.string()
      .email("Invalid email address")
      .required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], "Passwords must match")
      .required("Confirm password is required"),
    phone: Yup.string()
      .min(10, "Phone must be at least 10 characters")
      .required("Phone number is required"),
    address: Yup.string()
      .min(5, "Address must be at least 5 characters")
      .required("Delivery address is required"),
  });

  const formik = useFormik({
    initialValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      address: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        // Register the user
        await axios.post(`${API_URL}/auth/register`, {
          name: values.name,
          email: values.email,
          password: values.password,
          role: "customer",
          phone: values.phone,
          address: values.address,
        });

        toast.success("Registration successful! Please check your email to verify your account.");
        
        // Redirect to verification page
        router.push(`/verify-email?email=${encodeURIComponent(values.email)}`);
      } catch (error: any) {
        const message = error.response?.data?.message || "Registration failed";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-600 via-indigo-600 to-violet-500 flex items-center justify-center px-6 py-10">
      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full  max-w-280 bg-white rounded-3xl shadow-2xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      >
        {/* LEFT – Illustration */}
        <div className="hidden md:flex max-w-300 items-center justify-center bg-linear-to-br from-purple-100 to-indigo-100 p-0">
          <Image
            src="/p2.png"
            alt="Register Illustration"
            width={800}
            height={800}
            className="object-cover w-full h-full"
            priority
          />
        </div>

        {/* RIGHT – Form */}
        <div className="w-full flex items-center justify-center p-8">
          <div className="bg-purple-500 rounded-3xl shadow-2xl p-8 w-full max-w-md text-white">
          <motion.div
            initial={{ x: 30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-sm space-y-6"
          >
            {/* Header */}
            <div className="space-y-1 mb-2 text-center">
              <h2 className="text-3xl font-bold text-white">
                Create Account
              </h2>
              <p className="text-sm text-white">
                Register to access Mini ERP
              </p>
            </div>

            {/* Form */}
            <form onSubmit={formik.handleSubmit} className="space-y-4 mb-1 text-gray-900">
              <Input className="text-white"
                label="Full Name"
                placeholder="Full Name"
                type="text"
                required
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && formik.errors.name ? formik.errors.name : undefined}
              />

              <Input className="text-white"
                label="Email"
                placeholder="example@xyz.com"
                type="email"
                required
                name="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && formik.errors.email ? formik.errors.email : undefined}
              />

              <Input className="text-white"
                label="Password"
                placeholder="Enter your password"
                type="password"
                required
                name="password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.password && formik.errors.password ? formik.errors.password : undefined}
              />

              <Input className="text-white"
                label="Confirm Password"
                placeholder="Rewrite your Password"
                type="password"
                required
                name="confirmPassword"
                value={formik.values.confirmPassword}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : undefined}
              />

              <Input className="text-white"
                label="Phone Number"
                placeholder="Enter your phone number"
                type="tel"
                required
                name="phone"
                value={formik.values.phone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.phone && formik.errors.phone ? formik.errors.phone : undefined}
              />

              <Input className="text-white"
                label="Delivery Address"
                placeholder="Enter your delivery address"
                type="text"
                required
                name="address"
                value={formik.values.address}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.address && formik.errors.address ? formik.errors.address : undefined}
              />

              <Button
                type="submit"
                loading={loading}
                className="w-full mt-2 rounded-xl py-3 font-semibold bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition"
              >
                Create Account
              </Button>
            </form>

            {/* Footer */}
            <p className="text-center text-sm text-gray-200 mb-4">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-blue-900 hover:text-indigo-700"
              >
                Sign in
              </Link>
            </p>
          </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
