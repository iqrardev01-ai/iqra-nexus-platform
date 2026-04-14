import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { useAuth } from "../../context/AuthContext";
import { useMeetings } from "../../context/MeetingContext";
import { getUsersByRole } from "../../data/users";
import { Calendar, Clock, Check, X, Video } from "lucide-react";

const SchedulePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    meetings,
    availabilitySlots,
    updateMeetingStatus,
    addAvailabilitySlot,
    removeAvailabilitySlot,
    addMeeting
  } = useMeetings();
  const [view, setView] = useState("calendar");
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingType, setMeetingType] = useState("video");
  const [participantId, setParticipantId] = useState("");
  const [selectedStart, setSelectedStart] = useState("");
  const [selectedEnd, setSelectedEnd] = useState("");

  const partnerRole = user?.role === "investor" ? "entrepreneur" : "investor";
  const partners = user ? getUsersByRole(partnerRole) : [];

  useEffect(() => {
    if (!participantId && partners.length > 0) {
      setParticipantId(partners[0].id);
    }
  }, [partners, participantId]);

  const toLocalDateTime = (iso) => {
    if (!iso) return "";
    const date = new Date(iso);
    const tzOffset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - tzOffset * 60000);
    return local.toISOString().slice(0, 16);
  };

  const userMeetings = meetings.filter((m) => m.hostId === user?.id || m.participantId === user?.id);
  const pendingRequests = userMeetings.filter((m) => m.status === "pending" && m.participantId === user?.id);

  const calendarEvents = [
    ...userMeetings.map((m) => ({
      id: m.id,
      title: m.title,
      start: m.startTime,
      end: m.endTime,
      backgroundColor: m.status === "confirmed" ? "#3B82F6" : "#94A3B8",
      borderColor: m.status === "confirmed" ? "#2563EB" : "#64748B",
      extendedProps: { ...m, entryType: "meeting" }
    })),
    ...availabilitySlots.filter((s) => s.userId === user?.id).map((s) => ({
      id: s.id,
      title: "Available Slot",
      start: s.startTime,
      end: s.endTime,
      backgroundColor: "#10B981",
      borderColor: "#059669",
      extendedProps: { ...s, entryType: "slot" }
    }))
  ];

  const handleDateSelect = (selectInfo) => {
    setSelectedStart(toLocalDateTime(selectInfo.startStr));
    setSelectedEnd(toLocalDateTime(selectInfo.endStr));
    const title = prompt("Enter a title for your availability slot:");
    let calendarApi = selectInfo.view.calendar;
    calendarApi.unselect();

    if (title) {
      addAvailabilitySlot({
        userId: user.id,
        startTime: selectInfo.startStr,
        endTime: selectInfo.endStr
      });
    }
  };

  const handleCreateMeeting = (event) => {
    event.preventDefault();
    const partner = partners.find((p) => p.id === participantId) || partners[0];
    if (!partner || !user) return;

    const start = selectedStart ? new Date(selectedStart).toISOString() : new Date(Date.now() + 3600000).toISOString();
    const end = selectedEnd ? new Date(selectedEnd).toISOString() : new Date(Date.now() + 7200000).toISOString();

    addMeeting({
      title: meetingTitle || `Meeting with ${partner.name}`,
      startTime: start,
      endTime: end,
      hostId: user.id,
      hostName: user.name,
      participantId: partner.id,
      participantName: partner.name,
      status: "pending",
      type: meetingType,
      meetingLink: meetingType === "video" ? `/video/${partner.id}` : ""
    });

    setMeetingTitle("");
    setMeetingType("video");
    setSelectedStart("");
    setSelectedEnd("");
  };

  const handleJoinCall = (meeting) => {
    if (meeting.meetingLink) {
      navigate(meeting.meetingLink);
    }
  };

  const handleEventClick = (clickInfo) => {
    const event = clickInfo.event;
    const meeting = event.extendedProps;

    if (meeting.entryType === "slot") {
      if (window.confirm("Remove this availability slot?")) {
        removeAvailabilitySlot(meeting.id);
      }
      return;
    }

    if (meeting.status === "confirmed" && meeting.type === "video") {
      if (window.confirm(`Start Video Call for: ${event.title}?`)) {
        handleJoinCall(meeting);
      }
    } else {
      alert(`Meeting: ${event.title}\nStatus: ${meeting.status}\nType: ${meeting.type}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-outfit tracking-tight">Schedules & Meetings</h1>
          <p className="text-gray-500">Manage your availability and upcoming meetings</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setView("calendar")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${view === "calendar" ? "bg-primary-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
          >
            <Calendar className="w-4 h-4 inline-block mr-2" />
            Calendar
          </button>
          <button
            onClick={() => setView("requests")}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all relative ${view === "requests" ? "bg-primary-600 text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
          >
            <Clock className="w-4 h-4 inline-block mr-2" />
            Meetings
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                {pendingRequests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Quick Meeting Request</h2>
                <p className="mt-1 text-sm text-gray-500">Use the calendar to prefill a time range and send a request to a partner.</p>
              </div>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-primary-700">Week 1</span>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleCreateMeeting}>
              <div>
                <label className="text-sm font-medium text-gray-700">Partner</label>
                <select
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  {partners.map((partner) => (
                    <option key={partner.id} value={partner.id}>
                      {partner.name} — {partner.role === "investor" ? "Investor" : "Entrepreneur"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Meeting title</label>
                <input
                  type="text"
                  placeholder="e.g. Seed pitch review"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700">Meeting type</label>
                  <select
                    value={meetingType}
                    onChange={(e) => setMeetingType(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  >
                    <option value="video">Video Call</option>
                    <option value="in-person">In Person</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Request status</label>
                  <div className="mt-2 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-700">
                    Pending request
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Start</label>
                  <input
                    type="datetime-local"
                    value={selectedStart}
                    onChange={(e) => setSelectedStart(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">End</label>
                  <input
                    type="datetime-local"
                    value={selectedEnd}
                    onChange={(e) => setSelectedEnd(e.target.value)}
                    className="mt-2 block w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary-500/20 transition hover:bg-primary-700"
              >
                Send Meeting Request
              </button>
            </form>

            <p className="mt-4 text-sm text-gray-500">Tip: click a calendar slot to prefill start/end times and create availability.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900">Selected range</h2>
            {selectedStart ? (
              <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <div>
                  <span className="font-semibold text-slate-900">Start</span>
                  <p className="mt-1 text-slate-600">{new Date(selectedStart).toLocaleString()}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-900">End</span>
                  <p className="mt-1 text-slate-600">{new Date(selectedEnd).toLocaleString()}</p>
                </div>
                <p className="text-xs text-slate-500">You can edit these values before sending your request.</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-gray-500">Select a range on the calendar to load start/end times into the meeting request form.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {view === "calendar" ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="mb-6 flex flex-wrap items-center gap-6 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-500 border-2 border-primary-100" />
                  <span>Confirmed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400 border-2 border-slate-100" />
                  <span>Pending</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 border-2 border-emerald-100" />
                  <span>Available Slots</span>
                </div>
              </div>
              <div className="calendar-container border rounded-xl overflow-hidden bg-gray-50/50">
                <FullCalendar
                  plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                  initialView="timeGridWeek"
                  headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay"
                  }}
                  editable={true}
                  selectable={true}
                  selectMirror={true}
                  dayMaxEvents={true}
                  events={calendarEvents}
                  select={handleDateSelect}
                  eventClick={handleEventClick}
                  height="auto"
                  slotMinTime="08:00:00"
                  slotMaxTime="20:00:00"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMeetings.length > 0 ? (
                userMeetings.map((meeting) => (
                  <div key={meeting.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${meeting.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                            <Video className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{meeting.title}</h3>
                            <p className="text-sm text-gray-500">With {user?.id === meeting.hostId ? meeting.participantName : meeting.hostName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2 text-primary-500" />
                          {new Date(meeting.startTime).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2 text-primary-500" />
                          {new Date(meeting.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} -
                          {new Date(meeting.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>

                      <div className="mt-6 flex gap-3">
                        {meeting.status === "pending" && meeting.participantId === user?.id ? (
                          <>
                            <button
                              onClick={() => updateMeetingStatus(meeting.id, "confirmed")}
                              className="flex-1 bg-primary-600 text-white py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-500/20 active:scale-95 flex items-center justify-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Accept
                            </button>
                            <button
                              onClick={() => updateMeetingStatus(meeting.id, "declined")}
                              className="flex-1 bg-white border border-gray-200 text-gray-700 py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-gray-50 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                              <X className="w-4 h-4" />
                              Decline
                            </button>
                          </>
                        ) : meeting.status === "confirmed" && meeting.type === "video" ? (
                          <button
                            onClick={() => handleJoinCall(meeting)}
                            className="w-full bg-emerald-600 text-white py-2.5 px-4 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2"
                          >
                            <Video className="w-4 h-4" />
                            Start Video Call
                          </button>
                        ) : (
                          <div className={`w-full py-2.5 rounded-lg text-center text-sm font-bold border ${meeting.status === 'confirmed' ? 'bg-green-50 text-green-700 border-green-100' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                            {meeting.status === 'confirmed' ? 'Confirmed' : 'Status: ' + meeting.status}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-500">
                  <div className="p-4 bg-gray-50 rounded-full mb-4">
                    <Calendar className="w-12 h-12 text-gray-300" />
                  </div>
                  <p className="text-xl font-bold text-gray-800 tracking-tight">No upcoming meetings</p>
                  <p className="text-gray-500 max-w-xs text-center mt-1">Schedule your next pitch or availability slot to get started.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export {
  SchedulePage
};
