# Notification System Design
# Stage 1

# Notification System Design

# Problem Statement

The requirement is to design a notification service that allows applications to send notifications to logged-in users and allow frontend applications to fetch, manage, and receive notifications in real time.

The system should expose REST APIs for standard notification operations and support instant delivery whenever a new notification is generated.

# Main Features Supported

The notification service handles the following operations:

* Create and send a notification to a user
* Retrieve all notifications for a specific user
* Retrieve unread notifications
* Update notification status after user views it
* Delete notifications when required
* Show unread notification count in UI badge
* Push notifications instantly without page refresh

# API Standards

Base Route

text
/api/v1


Headers required for protected routes

json
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <access_token>"
}

Authentication is handled using token-based authentication so notifications are only accessible to authenticated users.

 API 1 : Create Notification

Used internally whenever a system event needs to generate a notification.

Endpoint

text
POST /api/v1/notifications


Request Body

json
{
  "userId": "U102",
  "title": "Payment Received",
  "message": "Your payment was completed successfully",
  "category": "transaction"
}


Response

json
{
  "success": true,
  "notificationId": "NT001"
}

# API 2 : Fetch User Notifications

Returns complete notification history for logged-in user.

Endpoint

text
GET /api/v1/notifications/{userId}


Response

json
{
  "notifications": [
    {
      "id": "NT001",
      "title": "Payment Received",
      "message": "Your payment was completed successfully",
      "isRead": false,
      "createdAt": "2026-06-29T11:20:00Z"
    }
  ]
}

# API 3 : Fetch Unread Notifications

Returns only unread notifications.

Endpoint

text
GET /api/v1/notifications/{userId}/unread


Response

json
{
  "notifications": [
    {
      "id": "NT001",
      "title": "Payment Received",
      "isRead": false
    }
  ]
}

# API 4 : Update Read Status

Triggered when user opens a notification.

Endpoint

text
PATCH /api/v1/notifications/{notificationId}


Request Body

json
{
  "isRead": true
}

Response

json
{
  "success": true,
  "message": "Status updated"
}


# API 5 : Delete Notification

Removes notification permanently from user history.

Endpoint

text
DELETE /api/v1/notifications/{notificationId}


Response
json
{
  "success": true,
  "message": "Notification removed"
}


# API 6 : Notification Count

Used by frontend to display unread count.

Endpoint

text
GET /api/v1/notifications/{userId}/count


Response

json
{
  "unreadCount": 4
}



# Notification Object Structure

Each notification stored in database contains:

json
{
  "notificationId": "NT001",
  "userId": "U102",
  "title": "Payment Received",
  "message": "Your payment was completed successfully",
  "category": "transaction",
  "isRead": false,
  "createdAt": "2026-06-29T11:20:00Z"
}


# Real Time Notification Delivery

Polling the server repeatedly creates unnecessary API calls, so real-time delivery should be handled using WebSocket connection.

Working approach:

* User logs in successfully
* Frontend establishes persistent WebSocket connection
* Backend keeps active socket session for connected users
* Whenever a notification is created, backend emits event immediately
* Frontend receives event and updates notification badge instantly

Connection Example

text
ws://server/notifications


Sample Event Payload

json
{
  "eventType": "NEW_NOTIFICATION",
  "data": {
    "title": "New Login Detected",
    "message": "Account accessed from another device"
  }
}


# High Level Architecture

Core components involved:

* Frontend Application
* Notification API Layer
* Notification Service
* Database Storage
* WebSocket Gateway
* Authentication Service

Flow

text
Client Request
      ↓
REST API Layer
      ↓
Notification Service
      ↓
Database Storage
      ↓
WebSocket Gateway
      ↓
Connected Client


# Design Decisions

The system is designed keeping these points in mind:

* APIs should remain simple and predictable
* Frontend should receive updates instantly
* Notification retrieval should be fast even with large records
* User should only access own notifications
* Architecture should support scaling when concurrent users increase


## Summary

The proposed design exposes a clean API contract for frontend integration while also supporting real-time notification delivery. REST APIs handle standard operations and WebSocket communication handles instant notification updates for active users.

# Stage 2

# SQL Queries Based on API Design

# 1. Create Notification

sql id="c1gj8m"
INSERT INTO notifications
(notification_id, user_id, title, message, category, is_read, created_at)

VALUES
('NT001', 'U102', 'Payment Received',
'Payment completed successfully',
'transaction', FALSE, CURRENT_TIMESTAMP);


### 2. Fetch All Notifications

sql id="5ngf0g"
SELECT *

FROM notifications

WHERE user_id = 'U102'

ORDER BY created_at DESC;


### 3. Fetch Unread Notifications

sql id="53v93q"
SELECT *

FROM notifications

WHERE user_id = 'U102'
AND is_read = FALSE

ORDER BY created_at DESC;


### 4. Mark Notification as Read

sql id="98a5ue"
UPDATE notifications

SET is_read = TRUE

WHERE notification_id = 'NT001';


### 5. Delete Notification
sql id="o6y3ri"
DELETE FROM notifications

WHERE notification_id = 'NT001';


### 6. Get Unread Count

sql id="p9jcy9"
SELECT COUNT(*)

FROM notifications

WHERE user_id = 'U102'
AND is_read = FALSE;


### 7. Fetch Latest Notifications
sql id="9jpl7r"
SELECT *

FROM notifications

WHERE user_id = 'U102'

ORDER BY created_at DESC

LIMIT 10;


### 8. Delete Old Notifications

sql id="rfxu58"
DELETE FROM notifications

WHERE created_at < NOW() - INTERVAL '90 days';





# Stage 3

# Query Given
sql
SELECT * FROM notifications
WHERE studentID = 1042 AND isRead = false
ORDER BY createdAt ASC;


Query is correct.


# Problems

* Large table size (5,000,000 records)
* Full table scan if index is missing
* SELECT * fetches unnecessary data
* Sorting increases execution time


# Improved Query

sql
SELECT notification_id, title, message, createdAt

FROM notifications

WHERE studentID = 1042
AND isRead = false

ORDER BY createdAt ASC;


# Index Required

sql
CREATE INDEX idx_student_notification

ON notifications(studentID, isRead, createdAt);


# Computation Cost

Without Index

text
O(n)


With Index

text
O(log n)

# Adding Index On Every Column

Not recommended.

Problems:

* Slower INSERT
* Slower UPDATE
* More storage usage
* Unnecessary indexes

Create indexes only on:

* WHERE columns
* ORDER BY columns
* Frequently searched columns


# Students Who Got Placement Notification In Last 7 Days

sql
SELECT DISTINCT studentID

FROM notifications

WHERE notificationType = 'Placement'

AND createdAt >= NOW() - INTERVAL '7 days';


# Better Optimization

* Composite indexing
* Avoid SELECT *
* Use pagination
* Archive old records
* Move old notifications to separate table
