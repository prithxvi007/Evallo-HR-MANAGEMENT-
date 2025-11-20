"use client";

import { useState, useEffect, useRef } from "react";
import { X, Save, Loader2, Users } from "lucide-react";
import { toast } from "react-hot-toast";

const TeamModal = ({ isOpen, onClose, team, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    department: "",
    teamLead: "",
    members: []
  });
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const modalRef = useRef(null);

  useEffect(() => {
    if (team) {
      setFormData({
        name: team.name || "",
        description: team.description || "",
        department: team.department || "",
        teamLead: team.teamLead?._id || "",
        members: team.members?.map(m => m._id) || []
      });
    } else {
      setFormData({
        name: "",
        description: "",
        department: "",
        teamLead: "",
        members: []
      });
    }
    setErrors({});
    setApiError("");
  }, [team, isOpen]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Authentication required");
          return;
        }

        const response = await fetch('/api/employees?limit=1000', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setEmployees(data.employees || []);
        } else {
          throw new Error('Failed to fetch employees');
        }
      } catch (error) {
        console.error('Error fetching employees:', error);
        toast.error("Failed to load employees");
      }
    };

    if (isOpen) {
      fetchEmployees();
    }
  }, [isOpen]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Team name is required";
    if (!formData.department.trim()) newErrors.department = "Department is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setApiError("");

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }

      const url = team ? `/api/teams/${team._id}` : '/api/teams';
      const method = team ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${team ? 'update' : 'create'} team`);
      }

      toast.success(team ? "Team updated successfully!" : "Team created successfully!");
      
      await onSave(data.team || data);
      onClose();
    } catch (error) {
      console.error('Error saving team:', error);
      setApiError(error.message);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    if (apiError) setApiError("");
  };

  const handleMemberChange = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(employeeId)
        ? prev.members.filter(id => id !== employeeId)
        : [...prev.members, employeeId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div ref={modalRef} className="bg-card rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-border">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">
            {team ? "Edit Team" : "Create New Team"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="mx-6 mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <p className="text-destructive text-sm">{apiError}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-input border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground ${
                  errors.name ? "border-destructive" : "border-border"
                }`}
                placeholder="Enter team name"
                disabled={loading}
              />
              {errors.name && (
                <p className="text-destructive text-sm mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                placeholder="Enter team description"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Department *
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                className={`w-full px-3 py-2 bg-input border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground ${
                  errors.department ? "border-destructive" : "border-border"
                }`}
                placeholder="Enter department"
                disabled={loading}
              />
              {errors.department && (
                <p className="text-destructive text-sm mt-1">{errors.department}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Team Lead
              </label>
              <select
                name="teamLead"
                value={formData.teamLead}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-input border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary text-foreground"
                disabled={loading}
              >
                <option value="">Select Team Lead</option>
                {employees.map(employee => (
                  <option key={employee._id} value={employee._id}>
                    {employee.firstName} {employee.lastName} - {employee.position}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Team Members */}
          <div className="border-t border-border pt-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users size={18} />
              Team Members ({formData.members.length})
            </h3>
            
            <div className="max-h-60 overflow-y-auto border border-border rounded-lg bg-input/50">
              {employees.map(employee => (
                <label key={employee._id} className="flex items-center gap-3 p-3 border-b border-border hover:bg-accent last:border-b-0 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.members.includes(employee._id)}
                    onChange={() => handleMemberChange(employee._id)}
                    className="rounded border-border text-primary focus:ring-primary"
                    disabled={loading}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{employee.firstName} {employee.lastName}</p>
                    <p className="text-sm text-muted-foreground">{employee.position} • {employee.department}</p>
                  </div>
                </label>
              ))}
            </div>
            
            {employees.length === 0 && (
              <p className="text-muted-foreground text-center py-4">No employees available</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-6 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-muted-foreground border border-border rounded-lg hover:bg-accent disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              {team ? "Update Team" : "Create Team"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModal;