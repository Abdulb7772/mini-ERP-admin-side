"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import Input from "./Input";
import Button from "./Button";
import Select from "./Select";

interface UserFormProps {
  initialValues?: {
    name: string;
    email: string;
    role: string;
    password?: string;
  };
  onSubmit: (values: any) => Promise<void>;
  isEditing?: boolean;
}

const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  role: Yup.string()
    .oneOf(["admin", "manager", "staff"], "Invalid role")
    .required("Role is required"),
  password: Yup.string().when([], {
    is: () => false,
    then: (schema) =>
      schema
        .min(6, "Password must be at least 6 characters")
        .required("Password is required"),
    otherwise: (schema) =>
      schema.min(6, "Password must be at least 6 characters"),
  }),
});

export default function UserForm({
  initialValues = {
    name: "",
    email: "",
    role: "staff",
    password: "",
  },
  onSubmit,
  isEditing = false,
}: UserFormProps) {
  const formik = useFormik({
    initialValues,
    validationSchema: isEditing
      ? validationSchema
      : validationSchema,
    validate: (values) => {
      const errors: any = {};
      if (!isEditing && !values.password) {
        errors.password = "Password is required";
      } else if (values.password && values.password.length < 6) {
        errors.password = "Password must be at least 6 characters";
      }
      return errors;
    },
    onSubmit: async (values, { setSubmitting, setErrors }) => {
      try {
        await onSubmit(values);
      } catch (error: any) {
        if (error.response?.data?.message) {
          setErrors({ email: error.response.data.message });
        }
      } finally {
        setSubmitting(false);
      }
    },
  });

  const roleOptions = [
    { value: "admin", label: "Admin" },
    { value: "manager", label: "Manager" },
    { value: "staff", label: "Staff" },
  ];

  return (
    <form onSubmit={formik.handleSubmit} className="space-y-6">
      {/* Name Input */}
      <Input
        label="Name"
        name="name"
        type="text"
        placeholder="Enter user name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name ? formik.errors.name : undefined}
        required
      />

      {/* Email Input */}
      <Input
        label="Email"
        name="email"
        type="email"
        placeholder="user@example.com"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email ? formik.errors.email : undefined}
        required
      />

      {/* Role Select */}
      <Select className="text-gray-800"
        label="Role"
        name="role"
        options={roleOptions}
        value={formik.values.role}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.role ? formik.errors.role : undefined}
        required
      />

      {/* Password Input */}
      <div>
        <Input
          label={isEditing ? "Password (leave blank to keep current)" : "Password"}
          name="password"
          type="password"
          placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.password ? formik.errors.password : undefined}
          required={!isEditing}
        />
        {isEditing && (
          <p className="mt-1 text-sm text-blue-700">
            Only enter a password if you want to change it
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="submit"
          disabled={formik.isSubmitting || !formik.isValid}
          className={`px-6 py-2 rounded-lg font-medium text-white ${
            formik.isSubmitting || !formik.isValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
          }`}
        >
          {formik.isSubmitting ? (
            <div className="flex items-center space-x-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              <span>{isEditing ? "Updating..." : "Creating..."}</span>
            </div>
          ) : (
            <span>{isEditing ? "Update User" : "Create User"}</span>
          )}
        </Button>
      </div>
    </form>
  );
}
