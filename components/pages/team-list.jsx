"use client";

import { useState, useEffect } from "react";
import { Search, Edit, Trash2, Plus, Users, Award, Users2, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import TeamModal from "@/components/modals/team-modal";
import ConfirmationModal from "@/components/modals/confirmation-modal";

export default function TeamList() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0
  });

  const fetchTeams = async (page = 1, search = "") => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required");
        return;
      }
      
      let url = `/api/teams?page=${page}&limit=${pagination.limit}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch teams');

      const data = await response.json();
      setTeams(data.teams || []);
      setPagination(data.pagination || {
        page: 1,
        limit: 9,
        total: 0,
        totalPages: 0
      });
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast.error("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchTeams(1, value);
  };

  const handleDeleteClick = (team) => {
    setTeamToDelete(team);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/teams/${teamToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete team');
      }

      toast.success("Team deleted successfully!");
      setDeleteModalOpen(false);
      setTeamToDelete(null);
      fetchTeams(pagination.page, searchTerm);
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error(error.message || "Failed to delete team");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setTeamToDelete(null);
  };

  const handleSaveTeam = async () => {
    await fetchTeams(pagination.page, searchTerm);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Team Management
            </h1>
            <p className="text-muted-foreground">
              Organize and oversee your teams
            </p>
          </div>
          <button
            onClick={() => {
              setEditingTeam(null);
              setModalOpen(true);
            }}
            className="bg-primary text-primary-foreground py-3 px-6 rounded-lg font-semibold flex items-center gap-2 hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus size={20} />
            Create Team
          </button>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search teams by name..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
            />
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 size={32} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {teams.map((team) => (
                <div
                  key={team._id}
                  className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-all duration-300 group"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Award size={18} className="text-primary" />
                        <h3 className="text-xl font-bold text-foreground">
                          {team.name}
                        </h3>
                      </div>
                      <p className="text-muted-foreground text-sm">
                        Lead: {team.teamLead ? `${team.teamLead.firstName} ${team.teamLead.lastName}` : 'Not assigned'}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTeam(team);
                          setModalOpen(true);
                        }}
                        className="p-2 hover:bg-accent rounded-md transition-colors text-primary"
                        title="Edit team"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(team)}
                        className="p-2 hover:bg-accent rounded-md transition-colors text-destructive"
                        title="Delete team"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Team description */}
                  <p className="text-muted-foreground text-sm mb-6 leading-relaxed line-clamp-2">
                    {team.description || 'No description provided.'}
                  </p>

                  {/* Team members badge */}
                  <div className="flex items-center gap-3 bg-primary/10 rounded-lg p-4 border border-primary/20">
                    <div className="bg-primary p-2.5 rounded-lg">
                      <Users size={18} className="text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold">
                        Team Members
                      </p>
                      <p className="text-2xl font-bold text-primary">
                        {team.members?.length || 0}
                      </p>
                    </div>
                  </div>

                  {/* Department */}
                  <div className="mt-3">
                    <span className="bg-secondary text-secondary-foreground text-xs font-medium px-2 py-1 rounded">
                      {team.department}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {teams.length === 0 && (
              <div className="text-center py-12">
                <Users2 size={48} className="mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? 'No teams found matching your search.' : 'No teams found.'}
                </p>
              </div>
            )}
          </>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => fetchTeams(pagination.page - 1, searchTerm)}
                disabled={pagination.page === 1}
                className="px-3 py-2 bg-input border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => fetchTeams(pagination.page + 1, searchTerm)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 bg-input border border-border rounded-md text-sm font-medium text-foreground hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Team Modal */}
      <TeamModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingTeam(null);
        }}
        team={editingTeam}
        onSave={handleSaveTeam}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Team"
        message={`Are you sure you want to delete the team "${teamToDelete?.name}"? This action cannot be undone and will remove all team assignments.`}
        confirmText="Delete Team"
        type="danger"
      />
    </div>
  );
}