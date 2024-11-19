"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const changelogData = [
  {
    version: "1.0.0",
    date: "2024-01-15",
    changes: [
      {
        type: "feature",
        description: "Initial release of Graham AI platform"
      },
      {
        type: "feature", 
        description: "AI Agent creation and management"
      },
      {
        type: "feature",
        description: "Voice customization and natural conversations"
      },
      {
        type: "feature",
        description: "Google Calendar integration for appointment scheduling"
      }
    ]
  }
];

export default function Changelog() {
  return (
    <div className="container max-w-4xl py-8">
      <h1 className="text-3xl font-bold text-blue-900 mb-8">Changelog</h1>
      
      <div className="space-y-6">
        {changelogData.map((release) => (
          <Card key={release.version} className="bg-white">
            <CardHeader className="border-b border-gray-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl text-blue-900">
                  Version {release.version}
                </CardTitle>
                <span className="text-sm text-gray-500">{release.date}</span>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {release.changes.map((change, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Badge 
                      variant={change.type === "feature" ? "default" : "destructive"}
                      className={`${
                        change.type === "feature" 
                          ? "bg-green-100 text-green-800 hover:bg-green-100" 
                          : "bg-red-100 text-red-800 hover:bg-red-100"
                      } capitalize`}
                    >
                      {change.type}
                    </Badge>
                    <span className="text-gray-700">{change.description}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
