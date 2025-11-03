import React, { useState, useMemo } from "react";

export default function App() {
  const [screen, setScreen] = useState("dashboard");
  const [query, setQuery] = useState("");

  const [events, setEvents] = useState([
    {
      id: "evt-1",
      title: "Freshers Welcome Stall",
      date: "2025-11-20",
      venue: "Central Lawn",
      hours: 4,
      approvalStatus: "approved",
      volunteers: [
        { id: "v1", name: "Aisha", role: "Check-in", status: "assigned", location: { x: 40, y: 30 }, score: 2 },
        { id: "v2", name: "Rohit", role: "Food Stall", status: "signed-up", location: { x: 60, y: 50 }, score: 1 }
      ],
      tasks: [
        { id: "t1", title: "Setup Stall 8:30", assignedTo: "v1", status: "todo" },
        { id: "t2", title: "Manage Food 9:00", assignedTo: "v2", status: "todo" }
      ],
      feedback: [{ id: "f1", name: "Priya", rating: 4, comment: "Well organised" }]
    },
    {
      id: "evt-2",
      title: "Tech Talk: AI for Good",
      date: "2025-12-05",
      venue: "Auditorium A",
      hours: 2,
      approvalStatus: "pending",
      volunteers: [],
      tasks: [],
      feedback: []
    }
  ]);

  const [selectedEventId, setSelectedEventId] = useState(events[0].id);
  const selectedEvent = useMemo(() => events.find((e) => e.id === selectedEventId), [events, selectedEventId]);

  function openEvent(id) {
    setSelectedEventId(id);
    setScreen("event");
  }

  function createEvent(payload) {
    const newEvent = {
      id: `evt-${Date.now()}`,
      title: payload.title,
      date: payload.date,
      venue: payload.venue,
      hours: payload.hours || 2,
      approvalStatus: "pending",
      volunteers: [],
      tasks: [],
      feedback: []
    };
    setEvents([newEvent, ...events]);
    setSelectedEventId(newEvent.id);
    setScreen("event");
  }

  function addVolunteer(vol) {
    setEvents(events.map((ev) => (ev.id === selectedEventId ? { ...ev, volunteers: [...ev.volunteers, vol] } : ev)));
  }

  function assignTask(task) {
    setEvents(events.map((ev) => (ev.id === selectedEventId ? { ...ev, tasks: [...ev.tasks, task] } : ev)));
  }

  function toggleCheckIn(volId) {
    setEvents(
      events.map((ev) => {
        if (ev.id !== selectedEventId) return ev;
        const volunteers = ev.volunteers.map((v) => (v.id === volId ? { ...v, status: v.status === "checked-in" ? "assigned" : "checked-in" } : v));
        return { ...ev, volunteers };
      })
    );
  }

  function raiseApproval(eventId) {
    setEvents(events.map((ev) => (ev.id === eventId ? { ...ev, approvalStatus: "pending" } : ev)));
  }

  function approveEvent(eventId) {
    setEvents(events.map((ev) => (ev.id === eventId ? { ...ev, approvalStatus: "approved" } : ev)));
  }

  function rejectEvent(eventId) {
    setEvents(events.map((ev) => (ev.id === eventId ? { ...ev, approvalStatus: "rejected" } : ev)));
  }

  function submitFeedback(eventId, feedback) {
    setEvents(events.map((ev) => (ev.id === eventId ? { ...ev, feedback: [...ev.feedback, feedback] } : ev)));
  }

  const totalVolunteers = selectedEvent ? selectedEvent.volunteers.length : 0;
  const checkedIn = selectedEvent ? selectedEvent.volunteers.filter((v) => v.status === "checked-in").length : 0;

  const eventsOnPlatform = events.length;
  const avgHours = events.length ? events.reduce((s, e) => s + (e.hours || 0), 0) / events.length : 0;
  const avgRating =
    events.length
      ? events.reduce((s, e) => s + (e.feedback.reduce((ss, f) => ss + f.rating, 0) || 0), 0) /
        (events.reduce((ss, e) => ss + Math.max(1, e.feedback.length), 0))
      : 0;
  const retentionRate =
    0.2 +
    (events.reduce((s, e) => s + (e.volunteers.filter((v) => v.status === "checked-in").length || 0), 0) /
      Math.max(1, events.reduce((s, e) => s + e.volunteers.length, 0))) || 0;

  function computeEfficiencyScore() {
    const score = Math.max(0, Math.min(100, Math.round((eventsOnPlatform * Math.max(1, avgHours) * ((avgRating || 3) / 5) * (1 + retentionRate)) * 3)));
    return score;
  }

  const efficiencyScore = computeEfficiencyScore();

  const pendingApprovals = events.filter((e) => e.approvalStatus === "pending");

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">CampusClub Admin</h1>
            <p className="text-sm text-gray-600">Organize events, manage volunteers, ship smoother campus experiences</p>
          </div>
          <nav className="flex gap-3 items-center">
            <button onClick={() => setScreen("dashboard")} className={`px-3 py-1 rounded ${screen === "dashboard" ? "bg-indigo-600 text-white" : "bg-white border"}`}>
              Dashboard
            </button>
            <button onClick={() => setScreen("create")} className={`px-3 py-1 rounded ${screen === "create" ? "bg-indigo-600 text-white" : "bg-white border"}`}>
              Create Event
            </button>
            <button onClick={() => setScreen("templates")} className={`px-3 py-1 rounded ${screen === "templates" ? "bg-indigo-600 text-white" : "bg-white border"}`}>
              Templates
            </button>
            <div className="ml-4 bg-white p-2 rounded shadow-sm text-sm">
              Signed in as <strong>you@college.edu</strong>
            </div>
          </nav>
        </header>

        {screen === "dashboard" && (
          <main>
            <section className="grid grid-cols-3 gap-4 mb-6">
              <div className="col-span-2 bg-white p-4 rounded shadow">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="font-semibold">Upcoming Events</h2>
                  <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events..." className="border rounded px-2 py-1 text-sm" />
                </div>
                <div className="divide-y">
                  {events.filter((ev) => ev.title.toLowerCase().includes(query.toLowerCase())).map((ev) => (
                    <div key={ev.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{ev.title}</div>
                        <div className="text-xs text-gray-500">
                          {ev.date} • {ev.venue} • {ev.volunteers.length} volunteers • {ev.hours}h • {ev.approvalStatus}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => openEvent(ev.id)} className="px-3 py-1 bg-indigo-600 text-white rounded text-sm">
                          Open
                        </button>
                        <button
                          onClick={() => {
                            setSelectedEventId(ev.id);
                            setScreen("quick-view");
                          }}
                          className="px-3 py-1 border rounded text-sm"
                        >
                          Quick View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded shadow">
                <h3 className="font-semibold mb-2">Quick Actions</h3>
                <div className="flex flex-col gap-2">
                  <button onClick={() => setScreen("create")} className="w-full py-2 bg-green-500 text-white rounded">
                    Create new event
                  </button>
                  <button onClick={() => setScreen("templates")} className="w-full py-2 border rounded">
                    Use template
                  </button>
                  <button onClick={() => alert("Exported volunteers CSV (mock)")} className="w-full py-2 border rounded">
                    Export volunteers
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium">Organizer Efficiency</h4>
                  <div className="text-3xl font-bold text-indigo-600">{efficiencyScore}</div>
                  <div className="text-xs text-gray-500">Composite score (higher = more efficient)</div>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-medium">Pending approvals</h4>
                  {pendingApprovals.length === 0 ? (
                    <div className="text-xs text-gray-500">No pending approvals</div>
                  ) : (
                    <ul className="text-sm mt-2">
                      {pendingApprovals.map((pa) => (
                        <li key={pa.id} className="flex items-center justify-between py-1">
                          <div>
                            {pa.title} • {pa.date}
                          </div>
                          <div className="flex gap-1">
                            <button onClick={() => approveEvent(pa.id)} className="px-2 py-1 bg-green-500 text-white rounded text-xs">
                              Approve
                            </button>
                            <button onClick={() => rejectEvent(pa.id)} className="px-2 py-1 border rounded text-xs">
                              Reject
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </section>

            <section className="grid grid-cols-3 gap-4">
              <div className="col-span-1 bg-white p-4 rounded shadow">
                <h4 className="font-semibold">Templates</h4>
                <ul className="mt-2 text-sm text-gray-600">
                  <li>— Stall Event (Setup, Food, Clean)</li>
                  <li>— Seminar (Host, Tech, Logistics)</li>
                  <li>— Drive (Checkpoints, Vehicles)</li>
                </ul>
                <div className="mt-3">
                  <button onClick={() => setScreen("templates")} className="px-3 py-1 border rounded">
                    Browse templates
                  </button>
                </div>
              </div>

              <div className="col-span-2 bg-white p-4 rounded shadow">
                <h4 className="font-semibold">Recent activity</h4>
                <div className="mt-3 text-sm text-gray-600">
                  <div>Riya commented on "Freshers Welcome Stall" volunteer list • 2h ago</div>
                  <div>New volunteer signed up for "Tech Talk: AI for Good" • 1d ago</div>
                </div>
              </div>
            </section>
          </main>
        )}

        {screen === "create" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold mb-4">Create Event</h2>
            <CreateEventForm onCreate={createEvent} onCancel={() => setScreen("dashboard")} />
            <div className="mt-4 text-sm text-gray-600">Note: Events created are sent for approval. Use "Raise for approval" after filling details.</div>
          </div>
        )}

        {screen === "templates" && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold mb-4">Event Templates</h2>
            <div className="grid grid-cols-3 gap-4">
              <TemplateCard
                title="Stall Event"
                summary="Setup, Food, Clean"
                onUse={() => {
                  setScreen("create");
                  setTimeout(() => alert("Template loaded into Create form (mock)"), 200);
                }}
              />
              <TemplateCard
                title="Seminar"
                summary="Host, Tech, Logistics"
                onUse={() => {
                  setScreen("create");
                  setTimeout(() => alert("Template loaded into Create form (mock)"), 200);
                }}
              />
              <TemplateCard
                title="Drive"
                summary="Checkpoints, Vehicles"
                onUse={() => {
                  setScreen("create");
                  setTimeout(() => alert("Template loaded into Create form (mock)"), 200);
                }}
              />
            </div>
          </div>
        )}

        {screen === "quick-view" && selectedEvent && (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="font-semibold text-xl">{selectedEvent.title}</h2>
                <div className="text-sm text-gray-500">
                  {selectedEvent.date} • {selectedEvent.venue}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setScreen("event")} className="px-3 py-1 bg-indigo-600 text-white rounded">
                  Open full
                </button>
                <button onClick={() => alert("Shared event link (mock)")} className="px-3 py-1 border rounded">
                  Share
                </button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <h4 className="font-medium">Volunteers</h4>
                <div className="mt-2 divide-y">
                  {selectedEvent.volunteers.length === 0 && <div className="text-sm text-gray-500 py-2">No volunteers yet</div>}
                  {selectedEvent.volunteers.map((v) => (
                    <div key={v.id} className="py-2 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{v.name}</div>
                        <div className="text-xs text-gray-500">
                          {v.role} • {v.status}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => toggleCheckIn(v.id)} className="px-2 py-1 border rounded text-sm">
                          {v.status === "checked-in" ? "Undo" : "Check-in"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-1">
                <h4 className="font-medium">Event snapshot</h4>
                <div className="mt-3 text-sm text-gray-600">Volunteers: {selectedEvent.volunteers.length}</div>
                <div className="text-sm text-gray-600">Checked-in: {checkedIn}</div>
                <div className="text-sm text-gray-600">Hours: {selectedEvent.hours}</div>
                <div className="mt-3">
                  <button onClick={() => setScreen("event")} className="px-3 py-1 bg-indigo-600 text-white rounded">
                    Manage
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === "event" && selectedEvent && (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold">{selectedEvent.title}</h2>
                <div className="text-sm text-gray-500">
                  {selectedEvent.date} • {selectedEvent.venue}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    raiseApproval(selectedEvent.id);
                    alert("Raised for approval (mock)");
                  }}
                  className="px-3 py-1 bg-yellow-500 text-white rounded"
                >
                  Raise for approval
                </button>
                <button
                  onClick={() => {
                    if (selectedEvent.approvalStatus === "approved") alert("Event already approved");
                    else approveEvent(selectedEvent.id);
                  }}
                  className="px-3 py-1 bg-green-500 text-white rounded"
                >
                  Approve (mock)
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText("https://campus.example/event/" + selectedEvent.id);
                    alert("Link copied (mock)");
                  }}
                  className="px-3 py-1 border rounded"
                >
                  Copy link
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <h4 className="font-medium">Live View</h4>
                <div className="mt-3 bg-gray-100 rounded p-3 h-64 relative">
                  {selectedEvent.volunteers.map((v) => (
                    <div key={v.id} className="absolute text-xs" style={{ left: `${v.location?.x || 10}%`, top: `${v.location?.y || 10}%` }}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow ${v.status === "checked-in" ? "bg-green-400 text-white" : "bg-indigo-200 text-indigo-800"}`}>
                        {v.name[0]}
                      </div>
                      <div className="text-xs mt-1 bg-white px-1 rounded shadow-sm">{v.name}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 bg-white p-3 rounded shadow-sm">
                  <h5 className="font-medium">Tasks</h5>
                  <div className="mt-2 divide-y">
                    {selectedEvent.tasks.length === 0 && <div className="text-sm text-gray-500 py-2">No tasks yet</div>}
                    {selectedEvent.tasks.map((t) => (
                      <div key={t.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{t.title}</div>
                          <div className="text-xs text-gray-500">Assigned to: {t.assignedTo || "—"}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => alert("Reassign (mock)")} className="px-2 py-1 border rounded text-sm">
                            Reassign
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => {
                        const id = `v-${Date.now()}`;
                        addVolunteer({ id, name: "New Volunteer", role: "Helper", location: { x: 20 + Math.random() * 60, y: 20 + Math.random() * 60 }, status: "signed-up" });
                      }}
                      className="px-3 py-1 bg-indigo-600 text-white rounded"
                    >
                      Add Volunteer
                    </button>
                    <button
                      onClick={() => {
                        const id = `t-${Date.now()}`;
                        assignTask({ id, title: "Clean up 11:00", assignedTo: null, status: "todo" });
                      }}
                      className="px-3 py-1 border rounded"
                    >
                      Add Task
                    </button>
                  </div>
                </div>
              </div>

              <aside className="col-span-1">
                <div className="bg-white p-3 rounded shadow-sm">
                  <h5 className="font-medium">Volunteer List</h5>
                  <div className="mt-2 divide-y">
                    {selectedEvent.volunteers.length === 0 && <div className="text-sm text-gray-500 py-2">No volunteers yet</div>}
                    {selectedEvent.volunteers.map((v) => (
                      <div key={v.id} className="py-2 flex items-center justify-between">
                        <div>
                          <div className="font-medium">{v.name}</div>
                          <div className="text-xs text-gray-500">{v.role}</div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => toggleCheckIn(v.id)} className="px-2 py-1 border rounded text-sm">
                            {v.status === "checked-in" ? "Undo" : "Check-in"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 bg-white p-3 rounded shadow-sm">
                  <h5 className="font-medium">Event snapshot</h5>
                  <div className="mt-2 text-sm text-gray-600">Volunteers: {totalVolunteers}</div>
                  <div className="text-sm text-gray-600">Checked-in: {checkedIn}</div>
                  <div className="text-sm text-gray-600">Hours: {selectedEvent.hours}</div>

                  <div className="mt-3">
                    <button onClick={() => setScreen("analytics")} className="w-full px-3 py-2 bg-indigo-600 text-white rounded">
                      View analytics
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}

        {screen === "analytics" && selectedEvent && (
          <div className="bg-white p-6 rounded shadow">
            <div className="flex justify-between items-center">
              <h2 className="font-semibold">Post-event Analytics: {selectedEvent.title}</h2>
              <div className="text-sm text-gray-500">
                Export: <button onClick={() => alert("CSV export (mock)")} className="underline">Volunteers</button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="col-span-2 bg-gray-50 p-4 rounded">
                <h4 className="font-medium">Participation</h4>
                <div className="mt-3 text-sm text-gray-600">Checked-in {checkedIn} / {totalVolunteers} volunteers</div>

                <div className="mt-4">
                  <h5 className="text-sm font-medium">Contribution</h5>
                  <div className="mt-2 space-y-2">
                    {selectedEvent.volunteers.map((v) => (
                      <div key={v.id} className="flex items-center gap-3">
                        <div className="w-20 text-xs">{v.name}</div>
                        <div className="flex-1 bg-white h-4 rounded shadow-sm">
                          <div style={{ width: `${20 + (v.score || 0) * 20}%` }} className="h-4 rounded bg-indigo-400"></div>
                        </div>
                        <div className="w-8 text-xs text-right">{20 + (v.score || 0) * 20}%</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h5 className="text-sm font-medium">Participant feedback</h5>
                  <div className="mt-2 text-sm text-gray-600">Avg rating: {selectedEvent.feedback.length ? (selectedEvent.feedback.reduce((s, f) => s + f.rating, 0) / selectedEvent.feedback.length).toFixed(1) : "—"}</div>
                  <div className="mt-3">
                    <button onClick={() => setScreen("collect-feedback")} className="px-3 py-1 border rounded">
                      Collect feedback
                    </button>
                  </div>

                  <div className="mt-4">
                    <h6 className="text-xs font-medium">Recent comments</h6>
                    <div className="mt-2 text-sm text-gray-600">
                      {selectedEvent.feedback.length === 0 && <div className="text-xs text-gray-500">No feedback yet</div>}
                      {selectedEvent.feedback.map((f) => (
                        <div key={f.id} className="py-1">
                          "{f.comment}" — <strong>{f.name}</strong> ({f.rating}/5)
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-1 bg-white p-4 rounded">
                <h4 className="font-medium">Post actions</h4>
                <div className="mt-3 text-sm text-gray-600">Send thank-you emails, assign badges, publish a summary to club page.</div>
                <div className="mt-3">
                  <button onClick={() => alert("Sent thank yous (mock)")} className="w-full py-2 bg-green-500 text-white rounded">
                    Send thank-you
                  </button>
                  <button onClick={() => alert("Badges assigned (mock)")} className="w-full mt-2 py-2 border rounded">
                    Assign badges
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {screen === "collect-feedback" && selectedEvent && (
          <div className="bg-white p-6 rounded shadow">
            <h2 className="font-semibold">Collect Feedback: {selectedEvent.title}</h2>
            <FeedbackForm
              onSubmit={(fb) => {
                submitFeedback(selectedEvent.id, { id: `f-${Date.now()}`, ...fb });
                alert("Feedback submitted (mock)");
                setScreen("analytics");
              }}
              onCancel={() => setScreen("analytics")}
            />
            <div className="mt-3 text-sm text-gray-500">Tip: Share the feedback link with volunteers and participants after the event to improve Avg rating.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function CreateEventForm({ onCreate, onCancel }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");
  const [hours, setHours] = useState(2);


