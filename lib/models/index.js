import mongoose from 'mongoose';

// Import schemas
import UserSchema from './User';
import EmployeeSchema from './Employee';
import TeamSchema from './Team';
import OrganizationSchema from './Organization';
import AuditLogSchema from './AuditLog';

// Register models if they don't exist
const models = {
  User: mongoose.models.User || mongoose.model('User', UserSchema),
  Employee: mongoose.models.Employee || mongoose.model('Employee', EmployeeSchema),
  Team: mongoose.models.Team || mongoose.model('Team', TeamSchema),
  Organization: mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema),
  AuditLog: mongoose.models.AuditLog || mongoose.model('AuditLog', AuditLogSchema),
};

export const { User, Employee, Team, Organization, AuditLog } = models;