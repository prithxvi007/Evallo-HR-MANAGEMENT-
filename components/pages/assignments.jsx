"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  X,
  Search,
  ChevronDown,
  ChevronUp,
  Link2Icon,
  Loader2
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function Assignments() {
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/assignments?search=${encodeURIComponent(searchTerm)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch assignments');
      }

      const data = await response.json();
      setEmployees(data.employees || []);
      setTeams(data.teams || []);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error(error.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [searchTerm]);

  const handleAssignTeam = async (employeeId, teamId) => {
    try {
      setAssigning(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          teamId,
          action: 'assign'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign team');
      }

      toast.success(data.message || 'Team assigned successfully!');
      await fetchAssignments();
    } catch (error) {
      console.error('Error assigning team:', error);
      toast.error(error.message || 'Failed to assign team');
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveTeam = async (employeeId, teamId) => {
    try {
      setAssigning(true);
      const token = localStorage.getItem('token');
      const response = await fetch('/api/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          employeeId,
          teamId,
          action: 'remove'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove team');
      }

      toast.success(data.message || 'Team removed successfully!');
      await fetchAssignments();
    } catch (error) {
      console.error('Error removing team:', error);
      toast.error(error.message || 'Failed to remove team');
    } finally {
      setAssigning(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Team Assignments
          </h1>
          <p className="text-muted-foreground">
            Manage employee-team relationships seamlessly
          </p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3.5 text-muted-foreground" size={18} />
            <input
              type="text"
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading assignments...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEmployees.map((employee) => (
              <div
                key={employee._id}
                className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() =>
                    setExpandedEmployee(
                      expandedEmployee === employee._id ? null : employee._id
                    )
                  }
                  className="w-full px-6 py-4 flex justify-between items-center hover:bg-accent transition-colors text-left group"
                >
                  <div className="flex-1">
                    <p className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {employee.fullName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {employee.department} • {employee.position}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-lg">
                      {employee.teams?.length || 0}{" "}
                      {employee.teams?.length === 1 ? "team" : "teams"}
                    </span>
                    <div className="text-muted-foreground group-hover:text-primary transition-colors">
                      {expandedEmployee === employee._id ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>
                </button>

                {expandedEmployee === employee._id && (
                  <div className="border-t border-border px-6 py-6 bg-accent/50">
                    {/* Assigned Teams */}
                    <div className="mb-8">
                      <h4 className="font-bold mb-4 text-lg text-foreground flex items-center gap-2">
                        <Link2Icon size={18} className="text-primary" />
                        Assigned Teams ({employee.teams?.length || 0})
                      </h4>
                      {employee.teams?.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {employee.teams.map((team) => (
                            <div
                              key={team._id}
                              className="bg-primary text-primary-foreground text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-sm hover:shadow-md transition-all group"
                            >
                              <span className="font-semibold">
                                {team.name}
                              </span>
                              <button
                                onClick={() => handleRemoveTeam(employee._id, team._id)}
                                disabled={assigning}
                                className="hover:bg-primary-foreground/20 p-0.5 rounded transition-all group-hover:scale-110 ml-1 disabled:opacity-50"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          No teams assigned
                        </p>
                      )}
                    </div>

                    {/* Available Teams */}
                    <div>
                      <h4 className="font-bold mb-4 text-lg text-foreground flex items-center gap-2">
                        <Plus size={18} className="text-green-600" />
                        Available Teams ({
                          teams.filter(t => !employee.teams?.some(et => et._id === t._id)).length
                        })
                      </h4>
                      {teams.filter(t => !employee.teams?.some(et => et._id === t._id)).length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {teams
                            .filter(team => !employee.teams?.some(et => et._id === team._id))
                            .map((team) => (
                              <button
                                key={team._id}
                                onClick={() => handleAssignTeam(employee._id, team._id)}
                                disabled={assigning}
                                className="bg-secondary text-secondary-foreground text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 border border-border hover:border-green-500 hover:bg-green-500/10 transition-all group disabled:opacity-50"
                              >
                                <Plus
                                  size={16}
                                  className="group-hover:rotate-90 transition-transform duration-300"
                                />
                                {team.name}
                              </button>
                            ))}
                        </div>
                      ) : (
                        <p className="text-muted-foreground text-sm italic">
                          All available teams assigned
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && filteredEmployees.length === 0 && (
          <div className="text-center py-16">
            <Link2Icon
              size={48}
              className="mx-auto text-muted-foreground mb-4 opacity-50"
            />
            <p className="text-muted-foreground text-lg font-medium">
              {searchTerm ? 'No employees found matching your search.' : 'No employees found.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}