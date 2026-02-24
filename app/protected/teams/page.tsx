"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { teamAPI, userAPI } from "@/services/apiService";
import Button from "@/components/Button";
import Modal from "@/components/Modal";
import Input from "@/components/Input";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import toast from "react-hot-toast";

export default function TeamsPage() {
  const { role } = useAuth(["admin", "top_manager"]);
  const [teams, setTeams] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    fetchTeams();
    fetchUsers();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const response = await teamAPI.getTeams();
      setTeams(response.data.data);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast.error("Failed to fetch teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await userAPI.getUsers();
      setUsers(response.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to fetch users");
    }
  };

  const handleAddNew = () => {
    setEditingTeam(null);
    setFormData({ name: "", description: "" });
    setSelectedMembers([]);
    setIsModalOpen(true);
  };

  const handleEdit = async (team: any) => {
    try {
      setEditingTeam(team);
      setFormData({
        name: team.name,
        description: team.description || "",
      });
      
      // Fetch team details to get members
      const response = await teamAPI.getTeam(team._id);
      const teamMembers = response.data.data.members || [];
      setSelectedMembers(teamMembers.map((m: any) => m._id));
      
      // Open modal after data is ready
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error fetching team details:", error);
      toast.error("Failed to load team details");
      setSelectedMembers([]);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this team? This action cannot be undone.")) {
      try {
        await teamAPI.deleteTeam(id);
        toast.success("Team deleted successfully!");
        fetchTeams();
      } catch (error) {
        console.error("Error deleting team:", error);
        toast.error("Failed to delete team");
      }
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      await teamAPI.toggleTeamStatus(id);
      toast.success("Team status updated successfully!");
      fetchTeams();
    } catch (error) {
      console.error("Error toggling team status:", error);
      toast.error("Failed to update team status");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: "", description: "" });
    setSelectedMembers([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Team name is required");
      return;
    }

    try {
      const payload = {
        ...formData,
        members: selectedMembers,
      };

      if (editingTeam) {
        await teamAPI.updateTeam(editingTeam._id, payload);
        toast.success("Team updated successfully!");
      } else {
        await teamAPI.createTeam(payload);
        toast.success("Team created successfully!");
      }
      fetchTeams();
      handleCloseModal();
    } catch (error: any) {
      console.error("Error saving team:", error);
      const message = error.response?.data?.message || "Failed to save team";
      toast.error(message);
    }
  };

  const toggleMemberSelection = (userId: string) => {
    setSelectedMembers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(teams.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTeams = teams.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-9 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-5 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <TableSkeleton rows={8} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600 mt-1">Manage teams and organize users</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Show:</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 text-black rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm bg-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          {role === "admin" && (
            <Button
              onClick={handleAddNew}
              className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <span>Add Team</span>
            </Button>
          )}
        </div>
      </div>

      {/* Teams Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-linear-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold">S.No</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Team Name</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Description</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Members</th>
                <th className="px-6 py-4 text-left text-sm font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teams.length > 0 ? (
                paginatedTeams.map((team: any, index: number) => (
                  <tr
                    key={team._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">
                        {startIndex + index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-100 to-indigo-100 flex items-center justify-center text-purple-600 font-bold text-sm mr-3">
                          {team.name.charAt(0).toUpperCase()}
                        </div>
                        <p className="font-medium text-gray-900">{team.name}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700">
                        {team.description || "No description"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {team.members && team.members.length > 0 ? (
                          <>
                            <div className="flex -space-x-2">
                              {team.members.slice(0, 3).map((member: any, idx: number) => (
                                <div
                                  key={member._id}
                                  className="w-8 h-8 rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                  title={member.name}
                                >
                                  {member.name.charAt(0).toUpperCase()}
                                </div>
                              ))}
                            </div>
                            {team.members.length > 3 && (
                              <span className="ml-2 text-xs text-gray-600 self-center">
                                +{team.members.length - 3} more
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs text-gray-500">No members</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {role === "admin" ? (
                        <select
                          value={team.isActive ? "active" : "inactive"}
                          onChange={() => handleToggleStatus(team._id)}
                          className={`px-3 py-1 text-sm rounded-lg border-2 font-medium transition-colors cursor-pointer ${
                            team.isActive
                              ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                              : "bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      ) : (
                        <span className={`px-3 py-1 text-sm rounded-lg inline-block ${
                          team.isActive
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                          {team.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {role === "admin" ? (
                        <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(team)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(team._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                      ) : (
                        <span className="text-sm text-gray-500">View only</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <svg
                        className="w-16 h-16 text-gray-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
                      </svg>
                      <p className="text-gray-500 text-lg">No teams found</p>
                      <p className="text-gray-400 text-sm">
                        Create your first team to get started
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {teams.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={teams.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Add/Edit Team Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTeam ? "Edit Team" : "Add New Team"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Team Name"
            name="name"
            type="text"
            placeholder="Enter team name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          {/* Members Multi-Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Team Members (Optional)
            </label>
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {users.length > 0 ? (
                users.map((user) => (
                  <div
                    key={user._id}
                    onClick={() => toggleMemberSelection(user._id)}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50 border-b last:border-b-0 ${
                      selectedMembers.includes(user._id) ? 'bg-purple-50' : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(user._id)}
                      onChange={() => toggleMemberSelection(user._id)}
                      className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500 mr-3"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-800' 
                        : user.role === 'manager'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                ))
              ) : (
                <p className="px-4 py-3 text-sm text-gray-500">No users available</p>
              )}
            </div>
            {selectedMembers.length > 0 && (
              <p className="text-sm text-gray-600 mt-2">
                {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              placeholder="Enter team description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={handleCloseModal}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="px-6 py-2 bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg"
            >
              {editingTeam ? "Update Team" : "Create Team"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
