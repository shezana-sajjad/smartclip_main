
import React, { useState } from "react";
import { WithChildren } from "@/components/types";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Calendar as CalendarIcon, 
  PlusCircle, 
  Clock, 
  Video 
} from "lucide-react";
import DashboardLayout from "@/components/Dashboard";

const Layout = ({ children }: WithChildren) => {
  return (
    <div className="container mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-2">Publishing Calendar</h1>
      <p className="text-foreground/70 mb-8">
        Schedule and organize your video content publishing.
      </p>
      {children}
    </div>
  );
};

const CalendarPage = () => {
  const [date, setDate] = useState(new Date());
  
  // Sample scheduled content
  const scheduledContent = [
    {
      id: 1,
      title: "Top 10 Tips for Video Editing",
      platform: "YouTube",
      date: new Date(2025, 3, 5, 14, 0), // April 5, 2025, 2:00 PM
    },
    {
      id: 2,
      title: "Behind the Scenes: Studio Tour",
      platform: "Instagram",
      date: new Date(2025, 3, 7, 10, 30), // April 7, 2025, 10:30 AM
    },
    {
      id: 3,
      title: "Quick Tutorial: Color Grading",
      platform: "TikTok",
      date: new Date(2025, 3, 10, 18, 0), // April 10, 2025, 6:00 PM
    },
  ];
  
  // Filter scheduled content for the selected date
  const eventsForSelectedDate = scheduledContent.filter(event => 
    event.date.getDate() === date.getDate() &&
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );
  
  return (
    <DashboardLayout>
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-4 md:col-span-1">
          <h2 className="font-medium mb-4 flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" /> Select Date
          </h2>
          <CalendarComponent
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
          />
          <Button className="w-full mt-4 gap-1">
            <PlusCircle className="h-4 w-4" /> Schedule New Video
          </Button>
        </Card>
        
        <Card className="p-4 md:col-span-2">
          <h2 className="font-medium mb-4">
            {date.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h2>
          
          {eventsForSelectedDate.length > 0 ? (
            <div className="space-y-4">
              {eventsForSelectedDate.map(event => (
                <div key={event.id} className="p-3 bg-muted rounded-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-foreground/70">{event.platform}</p>
                    </div>
                    <div className="text-sm text-foreground/70 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {event.date.toLocaleTimeString('en-US', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  <div className="mt-2 flex justify-end gap-2">
                    <Button size="sm" variant="outline" className="text-xs">Edit</Button>
                    <Button size="sm" variant="outline" className="text-xs">Reschedule</Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Video className="h-12 w-12 mx-auto text-foreground/30 mb-4" />
              <p className="text-foreground/70">No videos scheduled for this date</p>
              <Button className="mt-4 gap-1">
                <PlusCircle className="h-4 w-4" /> Add Video
              </Button>
            </div>
          )}
        </Card>
      </div>
      </DashboardLayout>
  );
};

export default CalendarPage;
