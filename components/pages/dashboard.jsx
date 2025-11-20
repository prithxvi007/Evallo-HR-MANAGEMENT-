"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Users2,
  Link2,
  Plus,
  TrendingUp,
  Building2,
  Calendar,
} from "lucide-react";
import { toast } from "react-hot-toast";
import EmployeeModal from "@/components/modals/employee-modal";
import TeamModal from "@/components/modals/team-modal";

export default function Dashboard() {
  const [employeeModalOpen, setEmployeeModalOpen] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalEmployees: 0,
    totalTeams: 0,
    totalAssignments: 0,
    avgTeamsPerEmployee: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      if (!token) {
        console.warn("No token found");
        return;
      }

      // Fetch data in parallel
      const [employeesResponse, teamsResponse, logsResponse] = await Promise.allSettled([
        fetch("/api/employees?limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/teams?limit=1000", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/logs?limit=5", {
          headers: { Authorization: `Bearer ${token}` },
        })
      ]);

      const employeesData = employeesResponse.status === 'fulfilled' && employeesResponse.value.ok 
        ? await employeesResponse.value.json() 
        : { employees: [] };

      const teamsData = teamsResponse.status === 'fulfilled' && teamsResponse.value.ok 
        ? await teamsResponse.value.json() 
        : { teams: [] };

      const logsData = logsResponse.status === 'fulfilled' && logsResponse.value.ok 
        ? await logsResponse.value.json() 
        : { logs: [] };

      const employees = employeesData.employees || [];
      const teams = teamsData.teams || [];

      const totalEmployees = employees.length;
      const totalTeams = teams.length;
      const totalAssignments = employees.reduce(
        (sum, emp) => sum + (emp.teams?.length || 0),
        0
      );
      const avgTeamsPerEmployee =
        totalEmployees > 0
          ? (totalAssignments / totalEmployees).toFixed(1)
          : "0.0";

      setStats({
        totalEmployees,
        totalTeams,
        totalAssignments,
        avgTeamsPerEmployee,
      });

      setRecentActivity(logsData.logs || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveEmployee = () => {
    fetchDashboardData();
    toast.success("Employee saved successfully!");
  };

  const handleSaveTeam = () => {
    fetchDashboardData();
    toast.success("Team saved successfully!");
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className="text-muted-foreground text-sm font-semibold uppercase tracking-wide">
          {label}
        </div>
        <div className={`bg-linear-to-br ${color} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-foreground">
        {loading ? (
          <div className="h-8 w-16 bg-muted rounded-lg animate-pulse"></div>
        ) : (
          value
        )}
      </div>
    </div>
  );

  const formatAction = (action) => {
    const actions = {
      login: "logged in",
      logout: "logged out",
      employee_create: "created employee",
      employee_update: "updated employee",
      employee_delete: "deleted employee",
      team_create: "created team",
      team_update: "updated team",
      team_delete: "deleted team",
      assignment_add: "assigned team",
      assignment_remove: "removed team assignment",
    };
    return actions[action] || action.replace("_", " ");
  };

  const formatUserName = (user) => {
    if (!user) return "System";
    return user.name || user.email || "Unknown User";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="space-y-3">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground bg-linear-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Welcome to Your Dashboard
            </h1>
            <div className="text-lg text-muted-foreground font-medium">
              Streamline your workforce management
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={Users}
            label="Total Employees"
            value={stats.totalEmployees}
            color="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={Users2}
            label="Active Teams"
            value={stats.totalTeams}
            color="from-green-500 to-green-600"
          />
          <StatCard
            icon={Link2}
            label="Team Assignments"
            value={stats.totalAssignments}
            color="from-purple-500 to-purple-600"
          />
          <StatCard
            icon={TrendingUp}
            label="Avg Teams/Emp"
            value={stats.avgTeamsPerEmployee}
            color="from-orange-500 to-orange-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => setEmployeeModalOpen(true)}
            disabled={loading}
            className="bg-primary text-primary-foreground py-4 px-8 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
          >
            <Plus
              size={22}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Add New Employee</span>
          </button>
          <button
            onClick={() => setTeamModalOpen(true)}
            disabled={loading}
            className="bg-green-600 text-white py-4 px-8 rounded-xl font-semibold flex items-center justify-center gap-3 hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl"
          >
            <Plus
              size={22}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
            <span>Create New Team</span>
          </button>
        </div>

        {/* Recent Activity */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar size={24} className="text-primary" />
              Recent Activity
            </h2>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2 disabled:opacity-50 hover:bg-accent px-3 py-1 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>

          {recentActivity.length > 0 ? (
            <div className="space-y-3">
              {recentActivity.slice(0, 5).map((log, index) => (
                <div
                  key={log._id || log.timestamp || index}
                  className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building2
                      size={18}
                      className="text-primary"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground font-medium">
                      <span className="font-semibold">
                        {formatUserName(log.userId)}
                      </span>{" "}
                      {formatAction(log.action)}
                      {log.meta?.employee && ` - ${log.meta.employee}`}
                      {log.meta?.team && ` - ${log.meta.team}`}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(log.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar size={48} className="mx-auto text-muted-foreground mb-4 opacity-50" />
              <div className="text-muted-foreground">
                No recent activity
              </div>
              <div className="text-sm text-muted-foreground mt-1">
                Activities will appear here as you use the system
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <EmployeeModal
        isOpen={employeeModalOpen}
        onClose={() => setEmployeeModalOpen(false)}
        onSave={handleSaveEmployee}
      />

      <TeamModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        onSave={handleSaveTeam}
      />
    </div>
  );
}