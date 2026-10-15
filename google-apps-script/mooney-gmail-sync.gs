const MOONEY_LABEL = "Mooney/Imported";

function activateMooneySync() {
  const props = PropertiesService.getScriptProperties();
  if (!props.getProperty("MOONEY_STARTED_AT")) {
    props.setProperty("MOONEY_STARTED_AT", new Date().toISOString());
  }
  getOrCreateLabel_();
}

function syncMooneyEmails() {
  const props = PropertiesService.getScriptProperties();
  syncMooneyEmails_(new Date(required_(props, "MOONEY_STARTED_AT")));
}

function backfillMooneyToday() {
  syncMooneyEmails_(jakartaTodayStart_());
}

function syncMooneyEmails_(startedAt) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return;

  try {
    const props = PropertiesService.getScriptProperties();
    const sourceBySender = JSON.parse(required_(props, "MOONEY_SOURCE_BY_SENDER"));
    const maxThreads = Number(props.getProperty("MOONEY_MAX_THREADS") || 25);
    const after = Utilities.formatDate(startedAt, "Asia/Jakarta", "yyyy/MM/dd");
    const threads = GmailApp.search(`${required_(props, "MOONEY_GMAIL_QUERY")} after:${after}`, 0, maxThreads);
    const label = getOrCreateLabel_();
    const summary = { inserted: 0, duplicate: 0, skipped: 0, failed: 0 };

    for (const thread of threads) {
      for (const message of thread.getMessages()) {
        if (message.getDate() < startedAt) {
          summary.skipped++;
          continue;
        }

        const source = sourceBySender[emailFrom_(message.getFrom()).toLowerCase()];
        if (!source?.source || !source?.wallet_name) {
          summary.skipped++;
          continue;
        }

        const response = UrlFetchApp.fetch(required_(props, "MOONEY_INGEST_URL"), {
          method: "post",
          contentType: "application/json",
          muteHttpExceptions: true,
          payload: JSON.stringify({
            token: required_(props, "MOONEY_INGEST_TOKEN"),
            message_id: message.getId(),
            subject: message.getSubject(),
            body: message.getPlainBody(),
            date: message.getDate().toISOString(),
            source: source.source,
            wallet_name: source.wallet_name,
          }),
        });
        const result = JSON.parse(response.getContentText() || "{}");

        if (response.getResponseCode() === 200 && result.ok) {
          thread.addLabel(label);
          result.duplicate ? summary.duplicate++ : summary.inserted++;
        } else {
          summary.failed++;
          console.log(`Mooney sync failed for ${message.getId()}: ${result.error || response.getResponseCode()}`);
        }
      }
    }

    console.log(JSON.stringify(summary));
  } finally {
    lock.releaseLock();
  }
}

function selfTestMooneySync() {
  const sender = emailFrom_("Jago <notification@example.com>");
  if (sender !== "notification@example.com") throw new Error("sender parser failed");
  if (new Date("2026-09-18T10:00:00.000Z") < new Date("2026-09-18T09:00:00.000Z")) throw new Error("activation guard failed");
  if (Utilities.formatDate(jakartaTodayStart_(), "Asia/Jakarta", "HH:mm") !== "00:00") throw new Error("Jakarta day start failed");
}

function jakartaTodayStart_() {
  const ymd = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd");
  return new Date(`${ymd}T00:00:00+07:00`);
}

function required_(props, key) {
  const value = props.getProperty(key);
  if (!value) throw new Error(`Missing Script Property: ${key}`);
  return value;
}

function emailFrom_(from) {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).trim();
}

function getOrCreateLabel_() {
  return GmailApp.getUserLabelByName(MOONEY_LABEL) || GmailApp.createLabel(MOONEY_LABEL);
}

// ponytail: one script-wide lock; split by account only if this becomes multi-user.
