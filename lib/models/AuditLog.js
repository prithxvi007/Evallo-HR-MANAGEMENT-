import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login', 'logout', 
      'employee_create', 'employee_update', 'employee_delete',
      'team_create', 'team_update', 'team_delete',
      'assignment_add', 'assignment_remove'
    ]
  },
  resourceType: {
    type: String,
    enum: ['user', 'employee', 'team', 'assignment', null],
    default: null
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  },
  meta: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: false
});

// Index for faster queries
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ organization: 1, timestamp: -1 });

// Remove version key
auditLogSchema.set('versionKey', false);

export default auditLogSchema;