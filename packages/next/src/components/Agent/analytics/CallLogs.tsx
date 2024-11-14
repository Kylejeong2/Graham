'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Phone, Clock, Calendar, AlertCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import type { Agent } from '@graham/db';
import type { CallLog } from './types/Analytics';

export const CallLogs = ({ agent }: { agent: Agent }) => {
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const queryClient = useQueryClient();

  const { data: calls, isLoading } = useQuery({
    queryKey: ['calls', agent.id],
    queryFn: async () => {
      const res = await fetch(`/api/agent/analytics/call-logs`, {
        method: 'GET',
        body: JSON.stringify({
          agentId: agent.id,
        }),
      });
      return res.json();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (callId: string) => {
      await fetch(`/api/agent/analytics/call-logs/${callId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidate and refetch calls
      queryClient.invalidateQueries({ queryKey: ['calls', agent.id] });
    }
  });

  if (isLoading) {
    return <Loader2 className="w-8 h-8 animate-spin" />;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls?.map((call: CallLog) => (
                <TableRow 
                  key={call.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => setSelectedCall(call)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{format(new Date(call.timestamp), 'MMM d, yyyy')}</span>
                      <span className="text-sm text-gray-500">
                        {format(new Date(call.timestamp), 'h:mm a')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{call.callerNumber}</TableCell>
                  <TableCell>{Math.round(call.duration / 60)}m {call.duration % 60}s</TableCell>
                  <TableCell>
                    <Badge variant={getOutcomeBadgeVariant(call.outcome)}>
                      {call.outcome || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteMutation.mutate(call.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={!!selectedCall} onOpenChange={() => setSelectedCall(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Call Details</DialogTitle>
          </DialogHeader>
          
          {selectedCall && (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 gap-4">
                <InfoCard
                  icon={<Phone className="w-4 h-4" />}
                  label="Caller"
                  value={selectedCall.callerNumber}
                />
                <InfoCard
                  icon={<Clock className="w-4 h-4" />}
                  label="Duration"
                  value={`${Math.round(selectedCall.duration / 60)}m ${selectedCall.duration % 60}s`}
                />
                <InfoCard
                  icon={<Calendar className="w-4 h-4" />}
                  label="Date & Time"
                  value={format(new Date(selectedCall.timestamp), 'PPpp')}
                />
                <InfoCard
                  icon={<AlertCircle className="w-4 h-4" />}
                  label="Outcome"
                  value={selectedCall.outcome || 'Unknown'}
                />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Call Summary</h3>
                <p className="text-sm text-gray-600">{selectedCall.summary}</p>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">Transcription</h3>
                <div className="max-h-48 overflow-y-auto rounded-lg border p-4">
                  <p className="text-sm text-gray-600 whitespace-pre-wrap">
                    {selectedCall.transcription}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

const InfoCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) => (
  <Card>
    <CardContent className="flex items-center space-x-4 pt-6">
      {icon}
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </CardContent>
  </Card>
);

const getOutcomeBadgeVariant = (outcome: string | undefined): "default" | "secondary" | "destructive" | "outline" => {
  if (!outcome) return "default";
  
  switch (outcome.toLowerCase()) {
    case 'appointment booked':
      return "default";
    case 'order placed':
      return "default"; 
    case 'callback requested':
      return "secondary";
    case 'no action':
      return "destructive";
    default:
      return "default";
  }
};