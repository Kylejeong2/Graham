export interface CallLog {
    id: string;
    timestamp: string;
    duration: number;
    summary?: string;
    outcome?: string;
    transcription?: string;
    callerNumber: string;
    secondsUsed: number;
    minutesUsed: number;
  }
  
  export interface AnalyticsData {
    totalCalls: number;
    averageDuration: number;
    callsByTime: {
      morning: number;
      afternoon: number;
      evening: number;
    };
    callOutcomes: {
      appointmentsBooked: number;
      ordersPlaced: number;
      questionsAnswered: number;
      noAction: number;
    };
    recentTrends: {
      callVolume: number;
      successRate: number;
    };
  }
  
  export interface InsightData {
    commonQueries: {
      topic: string;
      frequency: number;
    }[];
    peakTimes: {
      hour: number;
      calls: number;
    }[];
    averageMetrics: {
      responseTime: number;
      callDuration: number;
      satisfactionScore: number;
    };
    trends: {
      callVolume: {
        current: number;
        previous: number;
      };
      successRate: {
        current: number;
        previous: number;
      };
    };
  }