# Prompt 6.1 — Notification & Activity Feed System

## Context
CorpVerse has many events that users should be notified about: application status changes, interview invites, task assignments, promotions, scenario decisions, company updates. Currently there's no notification system — users only discover changes by refreshing their dashboard.

## Objective
Build an in-app notification system with an activity feed, unread badge counts, and real-time-like updates (via polling).

---

## Task 1: Notification Model

**Create**: `backend/src/models/Notification.js`

```javascript
const notificationSchema = new mongoose.Schema({
  recipient: { type: ObjectId, ref: 'User', required: true, index: true },
  type: {
    type: String,
    enum: [
      // Job Seeker
      'application_screening_passed', 'application_screening_rejected',
      'interview_started', 'interview_result',
      'offer_received', 'offer_expired',
      // Employee
      'task_assigned', 'task_completed', 'performance_warning',
      'promotion_available', 'promotion_executed', 'demotion',
      'fired', 'streak_milestone',
      // Founder
      'scenario_available', 'scenario_expired', 'scenario_outcome',
      'new_applicant', 'employee_hired', 'employee_resigned',
      'company_warning', 'company_suspended',
      // General
      'badge_unlocked', 'exp_gained', 'corpcoin_earned',
      'system_announcement',
    ],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  icon: { type: String, default: '🔔' },  // Emoji icon
  isRead: { type: Boolean, default: false },
  actionUrl: String,       // URL to navigate to when clicked
  metadata: mongoose.Schema.Types.Mixed,  // Additional context data
}, { timestamps: true });

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // TTL: 30 days
```

---

## Task 2: Notification Service

**Create**: `backend/src/services/notification.service.js`

```javascript
class NotificationService {
  /**
   * Create and dispatch a notification
   */
  async notify(recipientId, type, { title, message, icon, actionUrl, metadata } = {}) {
    const defaults = NOTIFICATION_DEFAULTS[type]; // Pre-configured templates
    
    return await Notification.create({
      recipient: recipientId,
      type,
      title: title || defaults.title,
      message: message || defaults.message,
      icon: icon || defaults.icon,
      actionUrl,
      metadata,
    });
  }

  /**
   * Get unread notifications for a user
   */
  async getNotifications(userId, { page = 1, limit = 20, unreadOnly = false }) {
    const filter = { recipient: userId };
    if (unreadOnly) filter.isRead = false;
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(limit),
      Notification.countDocuments(filter),
      Notification.countDocuments({ recipient: userId, isRead: false }),
    ]);
    
    return { notifications, total, unreadCount, page, limit };
  }

  /**
   * Mark notifications as read
   */
  async markRead(userId, notificationIds) {
    await Notification.updateMany(
      { _id: { $in: notificationIds }, recipient: userId },
      { isRead: true }
    );
  }

  /**
   * Mark all as read
   */
  async markAllRead(userId) {
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }
}
```

### 2.1 — Notification Templates
```javascript
const NOTIFICATION_DEFAULTS = {
  application_screening_passed: {
    title: 'Screening Passed! 🎉',
    message: 'Your application passed ATS screening. Start your interview now!',
    icon: '✅',
  },
  application_screening_rejected: {
    title: 'Application Update',
    message: 'Your application didn\'t pass screening. Check feedback for tips.',
    icon: '📊',
  },
  task_assigned: {
    title: 'New Task Available! 📋',
    message: 'A new daily task has been assigned. Complete it to earn EXP!',
    icon: '🎯',
  },
  promotion_available: {
    title: 'Promotion Available! ⚡',
    message: 'You\'re eligible for promotion! Check your profile to level up.',
    icon: '⭐',
  },
  badge_unlocked: {
    title: 'Achievement Unlocked! 🏆',
    message: 'You earned a new badge!',
    icon: '🏆',
  },
  scenario_available: {
    title: 'Business Decision Required! 📊',
    message: 'A new scenario requires your attention. Decide within 24 hours.',
    icon: '⚡',
  },
  // ... more templates
};
```

---

## Task 3: Notification Endpoints

**Create**: `backend/src/routes/notification.routes.js`

```javascript
router.get('/', requireAuth, controller.getNotifications);
router.get('/unread-count', requireAuth, controller.getUnreadCount);
router.patch('/read', requireAuth, controller.markRead);          // { ids: [...] }
router.patch('/read-all', requireAuth, controller.markAllRead);
```

Mount in `backend/src/routes/index.js`: `router.use('/notifications', require('./notification.routes'));`

---

## Task 4: Integrate Notifications Into Existing Flows

Add `notificationService.notify()` calls to all relevant service methods:

### Application Flow (application.service.js):
- After screening: `notify(userId, 'application_screening_passed/rejected')`

### Interview Flow (interview.service.js):
- After evaluation: `notify(userId, 'interview_result')`
- After offer: `notify(userId, 'offer_received')`

### Employee Flow (employee.service.js):
- Task assigned: `notify(userId, 'task_assigned')`
- Performance warning: `notify(userId, 'performance_warning')`

### Gamification (gamification.service.js):
- Badge unlocked: `notify(userId, 'badge_unlocked', { metadata: { badge } })`
- Promotion available: `notify(userId, 'promotion_available')`

### Founder Flow (scenario.service.js):
- New scenario: `notify(founderId, 'scenario_available')`
- New applicant: `notify(founderId, 'new_applicant', { metadata: { applicantName, roleName } })`

---

## Task 5: Frontend Notification Bell

### 5.1 — Notification Bell in Navbar
**File**: `frontend/src/components/layout/Navbar.jsx`

Add notification bell icon with unread badge:
```jsx
<div className="relative cursor-pointer" onClick={toggleNotificationPanel}>
  <Bell className="w-5 h-5 text-yellow-400" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  )}
</div>
```

### 5.2 — Notification Dropdown Panel
**Create**: `frontend/src/components/layout/NotificationPanel.jsx`

```
┌─────────────────────────────────────┐
│  🔔 NOTIFICATIONS        [Mark All] │
│─────────────────────────────────────│
│                                      │
│  ● Screening Passed! 🎉        2m   │
│    Your application passed ATS...    │
│                                      │
│  ● New Task Available! 📋     15m    │
│    A new daily task has been...       │
│                                      │
│  ○ Achievement Unlocked! 🏆    1h    │
│    You earned "Week Warrior"         │
│                                      │
│  ○ Business Decision! 📊      3h     │
│    A new scenario requires...        │
│                                      │
│  [View All Notifications →]          │
└─────────────────────────────────────┘
```

- ● = unread (bold), ○ = read (normal)
- Click notification → mark as read + navigate to actionUrl
- "Mark All Read" button at top
- "View All" links to full notification page
- Max 5 items in dropdown, paginated in full page

### 5.3 — Polling for New Notifications
```javascript
// Poll unread count every 30 seconds
useEffect(() => {
  const interval = setInterval(async () => {
    try {
      const { data } = await getUnreadCount();
      setUnreadCount(data.data.count);
    } catch (err) {
      // Silent fail — non-critical
    }
  }, 30000);
  return () => clearInterval(interval);
}, []);
```

### 5.4 — Notification API Service
**File**: `frontend/src/api/notifications.js`

```javascript
import client from './client';

export const getNotifications = (params) => client.get('/notifications', { params });
export const getUnreadCount = () => client.get('/notifications/unread-count');
export const markRead = (ids) => client.patch('/notifications/read', { ids });
export const markAllRead = () => client.patch('/notifications/read-all');
```

---

## Task 6: Full Notifications Page (Optional)

**Create**: `frontend/src/pages/Notifications.jsx`

Route: `/notifications`

Full-page view with:
- All notifications with pagination
- Filter: All / Unread
- Group by date (Today, Yesterday, This Week, Older)
- Each notification clickable → navigates to relevant page
- Bulk mark as read

---

## Acceptance Criteria
- [ ] Notification model created with TTL index (auto-delete after 30 days)
- [ ] Notifications created for all major platform events
- [ ] `GET /api/notifications` returns paginated notifications
- [ ] `GET /api/notifications/unread-count` returns count
- [ ] `PATCH /api/notifications/read` marks specific notifications as read
- [ ] `PATCH /api/notifications/read-all` marks all as read
- [ ] Notification bell in Navbar shows unread badge count
- [ ] Dropdown panel shows last 5 notifications
- [ ] Clicking notification navigates to relevant page
- [ ] Polling updates unread count every 30 seconds
- [ ] Notifications created on: screening result, interview result, task assigned, badge unlocked, promotion, scenario available
- [ ] Retro theme maintained on all notification UI
