"use client";

import { useFormik } from "formik";
import * as Yup from "yup";
import { useEffect, useState } from "react";
import Input from "./Input";
import Button from "./Button";
import Select from "./Select";
import { ROLE_OPTIONS } from "@/utils/roles";
import { teamAPI } from "@/services/apiService";

interface UserFormProps {
  initialValues?: {
    name: string;
    email: string;
    role: string;
    teams?: string[];
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
    .oneOf(
      ["admin", "inventory_manager", "employee_manager", "blog_manager", "order_manager", "customer_manager", "report_manager", "staff"],
      "Invalid role"
    )
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
    teams: [],
    password: "",
  },
  onSubmit,
  isEditing = false,
}: UserFormProps) {
  const [teams, setTeams] = useState<any[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoadingTeams(true);
      const response = await teamAPI.getTeams();
      setTeams(response.data.data.filter((team: any) => team.isActive));
    } catch (error) {
      console.error("Error fetching teams:", error);
    } finally {
      setLoadingTeams(false);
    }
  };

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

  const handleTeamToggle = (teamId: string) => {
    const currentTeams = formik.values.teams || [];
    const newTeams = currentTeams.includes(teamId)
      ? currentTeams.filter((id: string) => id !== teamId)
      : [...currentTeams, teamId];
    formik.setFieldValue("teams", newTeams);
  };

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
      <Select 
        className="text-gray-800"
        label="Role"
        name="role"
        options={ROLE_OPTIONS}
        value={formik.values.role}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.role ? formik.errors.role : undefined}
        required
      />

      {/* Teams Multi-Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Teams (Optional)
        </label>
        {loadingTeams ? (
          <div className="text-sm text-gray-500">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="text-sm text-gray-500">No teams available</div>
        ) : (
          <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
            {teams.map((team: any) => (
              <label
                key={team._id}
                className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={formik.values.teams?.includes(team._id) || false}
                  onChange={() => handleTeamToggle(team._id)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{team.name}</div>
                  {team.description && (
                    <div className="text-xs text-gray-500">{team.description}</div>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Select one or more teams for this user
        </p>
      </div>

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
