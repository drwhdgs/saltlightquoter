'use client';

import { useState, useMemo, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  Repeat,
  Cake,
  Plus,
  X,
  Trash,
} from 'lucide-react';

// 📅 Event type
interface CalendarEvent {
  id: string;
  title: string;
  date: string; // ISO date (yyyy-mm-dd)
  type: 'follow-up' | 'renewal' | 'birthday' | 'marketing' | string;
}

// 🎨 Helper: event color & icon
const getEventStyles = (type: string) => {
  switch (type) {
    case 'follow-up':
      return { Icon: PhoneCall, badge: 'bg-orange-500 text-white', title: 'Follow-Up' };
    case 'renewal':
      return { Icon: Repeat, badge: 'bg-blue-500 text-white', title: 'Renewal' };
    case 'birthday':
      return { Icon: Cake, badge: 'bg-yellow-400 text-black', title: 'Birthday' };
    case 'marketing':
      return { badge: 'bg-green-500 text-white', title: 'Marketing' };
    default:
      return { badge: 'bg-gray-300 text-gray-800', title: 'Event' };
  }
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventData, setEventData] = useState<Pick<CalendarEvent, 'title' | 'date' | 'type'>>({
    title: '',
    date: '',
    type: 'follow-up',
  });

  // 🧠 Load events from localStorage before render
  useEffect(() => {
    try {
      const saved = localStorage.getItem('calendar_events');
      if (saved) {
        const parsed: CalendarEvent[] = JSON.parse(saved);
        if (Array.isArray(parsed)) setEvents(parsed);
      }
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // 💾 Save to localStorage whenever events change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('calendar_events', JSON.stringify(events));
      } catch (err) {
        console.error('Failed to save events:', err);
      }
    }
  }, [events, isLoaded]);

  // ➕ or ✏️ Save Event
  const saveEvent = () => {
    if (!eventData.title || !eventData.date) return;

    setEvents((prev) => {
      if (selectedEvent) {
        return prev.map((e) =>
          e.id === selectedEvent.id ? { ...e, ...eventData } : e
        );
      } else {
        const newEvent: CalendarEvent = { id: Date.now().toString(), ...eventData };
        return [...prev, newEvent];
      }
    });

    closeModal();
  };

  const deleteEvent = () => {
    if (!selectedEvent) return;
    setEvents((prev) => prev.filter((e) => e.id !== selectedEvent.id));
    closeModal();
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setEventData({ title: '', date: '', type: 'follow-up' });
  };

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 🗓️ Generate calendar grid (warning-free)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const days: {
      date: Date | null;
      events: CalendarEvent[];
      isToday?: boolean;
    }[] = [];

    const startDay = firstDay.getDay();

    // Empty slots before month starts
    for (let i = 0; i < startDay; i++) days.push({ date: null, events: [] });

    // Fill month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = date.toISOString().split('T')[0];
      const dayEvents = events.filter((e) => e.date === dateString);

      days.push({
        date,
        events: dayEvents,
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }

    // Fill remaining cells to complete weeks
    const endDay = lastDay.getDay();
    const toFill = (7 - (endDay + 1)) % 7;
    for (let i = 0; i < toFill; i++) days.push({ date: null, events: [] });

    return days;
  }, [currentDate, events]);

  // 📆 Upcoming 5 events
  const upcomingEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return events
      .filter((e) => e.date >= today)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);
  }, [events]);

  const changeMonth = (offset: number) => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1)
    );
  };

  if (!isLoaded) return <div className="p-8 text-gray-500">Loading calendar...</div>;

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-extrabold text-gray-900">Calendar</h1>
        <Button
          onClick={() => {
            setEventData({ title: '', date: '', type: 'follow-up' });
            setSelectedEvent(null);
            setShowModal(true);
          }}
          className="bg-blue-500 text-white hover:bg-blue-600 font-semibold h-12 px-6"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Event
        </Button>
      </div>

      {/* ⚠️ Local Storage Warning */}
      <p className="text-sm text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-md px-3 py-2 max-w-xl">
        ⚠️ All data is stored locally in your browser. Clearing cookies, site data, or using private browsing will delete your saved events.
      </p>

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 🗓️ Calendar */}
        <Card className="shadow-xl rounded-xl lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
            <Button variant="outline" size="icon" onClick={() => changeMonth(-1)}>
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {currentDate.toLocaleString('default', {
                month: 'long',
                year: 'numeric',
              })}
            </CardTitle>
            <Button variant="outline" size="icon" onClick={() => changeMonth(1)}>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            {/* Day labels */}
            <div className="grid grid-cols-7 gap-px border-b border-gray-200">
              {daysOfWeek.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-sm font-semibold text-gray-500 uppercase"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px">
              {calendarDays.map((day, i) => (
                <div
                  key={i}
                  className={`relative h-36 p-2 border border-gray-100 ${
                    day.date ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                  }`}
                  onClick={() => {
                    if (day.date) {
                      setEventData({
                        ...eventData,
                        date: day.date.toISOString().split('T')[0],
                      });
                      setSelectedEvent(null);
                      setShowModal(true);
                    }
                  }}
                >
                  {day.date && (
                    <>
                      <span
                        className={`font-semibold ${
                          day.isToday
                            ? 'bg-blue-600 text-white rounded-full h-7 w-7 flex items-center justify-center'
                            : 'text-gray-700'
                        }`}
                      >
                        {day.date.getDate()}
                      </span>

                      {/* Events in Day */}
                      <div className="mt-2 space-y-1">
                        {day.events.map((ev) => {
                          const { badge } = getEventStyles(ev.type);
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(ev);
                                setEventData(ev);
                                setShowModal(true);
                              }}
                              className={`w-full rounded-md px-2 py-1 text-xs font-medium shadow-sm ${badge} hover:opacity-90 transition truncate cursor-pointer`}
                            >
                              {ev.title}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 📆 Upcoming Events Sidebar */}
        <Card className="shadow-xl rounded-xl lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-800">
              Upcoming Schedule
            </CardTitle>
            <p className="text-sm text-gray-500">Your next 5 upcoming events.</p>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 py-4">No upcoming events found.</p>
            ) : (
              <div className="space-y-4">
                {upcomingEvents.map((ev) => {
                  const { Icon, badge, title } = getEventStyles(ev.type);
                  return (
                    <div
                      key={ev.id}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg border"
                    >
                      {Icon && <Icon className="h-5 w-5 mt-1" />}
                      <div>
                        <span className="font-semibold text-gray-900">
                          {ev.title}
                        </span>
                        <div className="text-sm text-gray-600">
                          {new Date(ev.date + 'T00:00:00').toLocaleDateString('default', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <Badge className={`mt-2 max-w-fit ${badge}`}>{title}</Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 🪟 Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-bold mb-4">
              {selectedEvent ? 'Edit Event' : 'Add New Event'}
            </h2>

            <div className="space-y-4">
              <Input
                placeholder="Event title"
                value={eventData.title}
                onChange={(e) => setEventData({ ...eventData, title: e.target.value })}
              />
              <Input
                type="date"
                value={eventData.date}
                onChange={(e) => setEventData({ ...eventData, date: e.target.value })}
              />
              <select
                className="w-full border rounded-lg px-3 py-2 text-gray-700"
                value={eventData.type}
                onChange={(e) => setEventData({ ...eventData, type: e.target.value })}
              >
                <option value="follow-up">Follow-Up</option>
                <option value="renewal">Renewal</option>
                <option value="birthday">Birthday</option>
                <option value="marketing">Marketing</option>
              </select>
            </div>

            <div className="mt-6 flex justify-between">
              {selectedEvent ? (
                <Button
                  variant="destructive"
                  onClick={deleteEvent}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash className="w-4 h-4 mr-2" /> Delete
                </Button>
              ) : (
                <div />
              )}
              <div className="flex gap-3">
                <Button variant="outline" onClick={closeModal}>
                  Cancel
                </Button>
                <Button
                  onClick={saveEvent}
                  className="bg-blue-600 text-white hover:bg-blue-700"
                >
                  {selectedEvent ? 'Save Changes' : 'Save Event'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}