'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from './components/DateRangePicker';
import { formatDuration } from './utils/analytics-functions';
import type { Agent } from "@graham/db";
import type { DateRange } from "react-day-picker";

const CALL_TAGS = [
  'SALES_OPPORTUNITY',
  'SUPPORT_ISSUE',
  'GENERAL_INQUIRY',
  'COMPLAINT',
  'FOLLOW_UP_REQUIRED',
  'RESOLVED',
  'HIGH_PRIORITY',
] as const;

const SENTIMENTS = ['POSITIVE', 'NEUTRAL', 'NEGATIVE'] as const;

interface CallLogsProps {
  agent: Agent;
}

export const CallLogs: React.FC<CallLogsProps> = ({ agent }) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedSentiment, setSelectedSentiment] = useState<typeof SENTIMENTS[number] | 'ALL'>('ALL');
  const [selectedTag, setSelectedTag] = useState<typeof CALL_TAGS[number] | 'ALL'>('ALL');

  const { data, isLoading } = useQuery({
    queryKey: ['analytics', agent.id, dateRange?.from, dateRange?.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        agentId: agent.id,
        ...(dateRange?.from && { startDate: dateRange.from.toISOString() }),
        ...(dateRange?.to && { endDate: dateRange.to.toISOString() }),
      });

      const response = await fetch(`/api/agent/analytics?${params}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');
      return response.json();
    },
  });

  const filteredCalls = data?.calls?.filter((call: any) => {
    if (selectedSentiment !== 'ALL' && call.sentiment !== selectedSentiment) return false;
    if (selectedTag !== 'ALL' && !call.tags.includes(selectedTag)) return false;
    return true;
  }) || [];

  const getSentimentColor = (sentiment: typeof SENTIMENTS[number]) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'bg-green-100 text-green-800';
      case 'NEGATIVE':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTagColor = (tag: typeof CALL_TAGS[number]) => {
    const colors: Record<typeof CALL_TAGS[number], string> = {
      SALES_OPPORTUNITY: 'bg-blue-100 text-blue-800',
      SUPPORT_ISSUE: 'bg-yellow-100 text-yellow-800',
      GENERAL_INQUIRY: 'bg-purple-100 text-purple-800',
      COMPLAINT: 'bg-red-100 text-red-800',
      FOLLOW_UP_REQUIRED: 'bg-orange-100 text-orange-800',
      RESOLVED: 'bg-green-100 text-green-800',
      HIGH_PRIORITY: 'bg-pink-100 text-pink-800',
    };
    return colors[tag];
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow">
        <div className="flex gap-4">
          <Select onValueChange={(value) => setSelectedSentiment(value as typeof SENTIMENTS[number] | 'ALL')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by sentiment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Sentiments</SelectItem>
              {SENTIMENTS.map((sentiment) => (
                <SelectItem key={sentiment} value={sentiment}>
                  {sentiment}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setSelectedTag(value as typeof CALL_TAGS[number] | 'ALL')}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Tags</SelectItem>
              {CALL_TAGS.map((tag) => (
                <SelectItem key={tag} value={tag}>
                  {tag.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>

        <Button onClick={() => {
          setDateRange(undefined);
          setSelectedSentiment('ALL');
          setSelectedTag('ALL');
        }}>
          Reset Filters
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date & Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Caller</TableHead>
              <TableHead>Sentiment</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredCalls.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No calls found for the selected filters
                </TableCell>
              </TableRow>
            ) : (
              filteredCalls.map((call: any) => (
                <TableRow key={call.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(call.timestamp), 'MMM d, yyyy')}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(call.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{formatDuration(call.duration)}</TableCell>
                  <TableCell>{call.callerNumber}</TableCell>
                  <TableCell>
                    {call.sentiment && (
                      <Badge className={getSentimentColor(call.sentiment)}>
                        {call.sentiment}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {call.tags.map((tag: typeof CALL_TAGS[number]) => (
                        <Badge key={tag} className={getTagColor(tag)}>
                          {tag.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={call.tags.includes('RESOLVED') ? 'default' : 'secondary'}>
                      {call.tags.includes('RESOLVED') ? 'Resolved' : 'Open'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Details</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>Call Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <h4 className="font-medium">Summary</h4>
                              <p className="text-sm">{call.summary}</p>
                            </div>
                            <div className="space-y-2">
                              <h4 className="font-medium">Call Data</h4>
                              <pre className="text-sm bg-gray-50 p-2 rounded">
                                {JSON.stringify(call.callData, null, 2)}
                              </pre>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h4 className="font-medium">Transcription</h4>
                            <div className="max-h-[300px] overflow-y-auto bg-gray-50 p-4 rounded">
                              <p className="text-sm whitespace-pre-wrap">{call.transcription}</p>
                            </div>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};