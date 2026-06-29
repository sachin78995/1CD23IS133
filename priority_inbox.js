const notifications = [
  {
    ID: "d146095a",
    Type: "Result",
    Message: "mid-sem",
    Timestamp: "2026-04-22 17:51:30"
  },
  {
    ID: "b283218f",
    Type: "Placement",
    Message: "CSX Corporation hiring",
    Timestamp: "2026-04-22 17:51:18"
  },
  {
    ID: "81589ada",
    Type: "Event",
    Message: "farewell",
    Timestamp: "2026-04-22 17:51:06"
  },
  {
    ID: "0005513a",
    Type: "Result",
    Message: "mid-sem",
    Timestamp: "2026-04-22 17:50:54"
  },
  {
    ID: "ea836726",
    Type: "Result",
    Message: "project-review",
    Timestamp: "2026-04-22 17:50:42"
  },
  {
    ID: "003cb427",
    Type: "Result",
    Message: "external",
    Timestamp: "2026-04-22 17:50:30"
  },
  {
    ID: "e5c4ff20",
    Type: "Result",
    Message: "project-review",
    Timestamp: "2026-04-22 17:50:18"
  },
  {
    ID: "1cfce5ee",
    Type: "Event",
    Message: "tech-fest",
    Timestamp: "2026-04-22 17:50:06"
  },
  {
    ID: "cf2885a6",
    Type: "Result",
    Message: "project-review",
    Timestamp: "2026-04-22 17:49:54"
  },
  {
    ID: "8a7412bd",
    Type: "Placement",
    Message: "AMD hiring",
    Timestamp: "2026-04-22 17:49:42"
  }
];

const priorityWeight = {
  Placement: 3,
  Result: 2,
  Event: 1
};

function calculateScore(notification) {
  const weight = priorityWeight[notification.Type];
  const time = new Date(notification.Timestamp).getTime();

  return (weight * 1000000000000) + time;
}

function getTopNotifications(notificationList, n = 10) {
  return notificationList
    .map(notification => ({
      ...notification,
      score: calculateScore(notification)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

function addNotification(newNotification) {
  notifications.push(newNotification);
  return getTopNotifications(notifications);
}

const top10 = getTopNotifications(notifications);

console.log("TOP 10 PRIORITY NOTIFICATIONS\n");

top10.forEach((notification, index) => {
  console.log(
    `${index + 1}. ${notification.Type} | ${notification.Message} | ${notification.Timestamp}`
  );
});

const newNotification = {
  ID: "NEW101",
  Type: "Placement",
  Message: "Google hiring",
  Timestamp: "2026-04-22 18:00:00"
};

const updatedTop10 = addNotification(newNotification);

console.log("\nUPDATED TOP 10 AFTER NEW NOTIFICATION\n");

updatedTop10.forEach((notification, index) => {
  console.log(
    `${index + 1}. ${notification.Type} | ${notification.Message} | ${notification.Timestamp}`
  );
});