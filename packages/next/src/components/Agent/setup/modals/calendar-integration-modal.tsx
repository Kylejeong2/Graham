import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, CalendarDays, Loader2, ArrowRight } from "lucide-react";

interface CalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  calendarStep: 'select' | 'google' | 'servicetitan';
  setCalendarStep: (step: 'select' | 'google' | 'servicetitan') => void;
  isConnectingCalendar: boolean;
  handleGoogleAuth: () => Promise<void>;
}

export const CalendarIntegrationModal = ({
  isOpen,
  onClose,
  calendarStep,
  setCalendarStep,
  isConnectingCalendar,
  handleGoogleAuth
}: CalendarModalProps) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-md bg-white">
      <DialogHeader>
        <DialogTitle className="text-blue-900 flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-orange-500" />
          {calendarStep === 'select' ? 'Calendar Integration' : 
           calendarStep === 'google' ? 'Connect Google Calendar' : 
           'ServiceTitan Calendar'}
        </DialogTitle>
      </DialogHeader>

      {calendarStep === 'select' ? (
        <div className="space-y-4">
          <Button 
            onClick={() => setCalendarStep('google')}
            className="w-full justify-between group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              Google Calendar
            </div>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <Button 
            disabled
            className="w-full justify-between opacity-50 bg-black text-white"
          >
            <div className="flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              ServiceTitan
            </div>
            <Badge variant="outline" className="ml-2 text-white border-blue-200">Coming Soon</Badge>
          </Button>
        </div>
      ) : calendarStep === 'google' ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Connect your Google Calendar to enable automatic appointment scheduling through your AI agent.
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
              <Calendar className="w-4 h-4" />
              Your agent will be able to:
            </div>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Check your availability</li>
              <li>Schedule appointments</li>
              <li>Send calendar invites</li>
              <li>Manage appointment changes</li>
            </ul>
          </div>
          <Button 
            onClick={handleGoogleAuth}
            disabled={isConnectingCalendar}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            {isConnectingCalendar ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <CalendarDays className="w-4 h-4 mr-2" />
                Connect Google Calendar
              </>
            )}
          </Button>
        </div>
      ) : null}

      {calendarStep !== 'select' && (
        <Button
          variant="ghost"
          onClick={() => setCalendarStep('select')}
          className="mt-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          ← Back to integrations
        </Button>
      )}
    </DialogContent>
  </Dialog>
);