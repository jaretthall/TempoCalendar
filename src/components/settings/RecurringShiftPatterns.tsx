import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Printer, RefreshCw } from "lucide-react";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface RecurringPattern {
  id: string;
  providerId: string;
  providerName: string;
  providerColor: string;
  clinicTypeId: string;
  clinicTypeName: string;
  clinicTypeColor: string;
  pattern: "daily" | "weekly" | "biweekly";
  startDate: Date;
  endDate?: Date;
  startTime: string;
  endTime: string;
  location?: string;
  isVacation: boolean;
  notes?: string;
}

interface Provider {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface ClinicType {
  id: string;
  name: string;
  color: string;
  isActive: boolean;
}

interface RecurringShiftPatternsProps {
  providers: Provider[];
  clinicTypes: ClinicType[];
  recurringPatterns?: RecurringPattern[];
}

const RecurringShiftPatterns = ({
  providers = [],
  clinicTypes = [],
  recurringPatterns = [],
}: RecurringShiftPatternsProps) => {
  const [patterns, setPatterns] =
    useState<RecurringPattern[]>(recurringPatterns);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Mock data for demonstration if no patterns are provided
  useEffect(() => {
    if (
      patterns.length === 0 &&
      providers.length > 0 &&
      clinicTypes.length > 0
    ) {
      const mockPatterns: RecurringPattern[] = [
        {
          id: "pattern-1",
          providerId: providers[0].id,
          providerName: providers[0].name,
          providerColor: providers[0].color,
          clinicTypeId: clinicTypes[0].id,
          clinicTypeName: clinicTypes[0].name,
          clinicTypeColor: clinicTypes[0].color,
          pattern: "weekly",
          startDate: new Date(2023, 0, 1), // Jan 1, 2023
          endDate: new Date(2023, 2, 31), // Mar 31, 2023
          startTime: "09:00",
          endTime: "17:00",
          location: "Main Building",
          isVacation: false,
          notes: "Regular weekly shift",
        },
        {
          id: "pattern-2",
          providerId: providers[1].id,
          providerName: providers[1].name,
          providerColor: providers[1].color,
          clinicTypeId: clinicTypes[0].id,
          clinicTypeName: clinicTypes[0].name,
          clinicTypeColor: clinicTypes[0].color,
          pattern: "biweekly",
          startDate: new Date(2023, 0, 15), // Jan 15, 2023
          startTime: "10:00",
          endTime: "18:00",
          location: "East Wing",
          isVacation: false,
          notes: "Biweekly rotation",
        },
        {
          id: "pattern-3",
          providerId: providers[2].id,
          providerName: providers[2].name,
          providerColor: providers[2].color,
          clinicTypeId: clinicTypes[1].id,
          clinicTypeName: clinicTypes[1].name,
          clinicTypeColor: clinicTypes[1].color,
          pattern: "daily",
          startDate: new Date(2023, 1, 1), // Feb 1, 2023
          endDate: new Date(2023, 1, 28), // Feb 28, 2023
          startTime: "08:00",
          endTime: "16:00",
          location: "Urgent Care Center",
          isVacation: false,
          notes: "Daily coverage for February",
        },
      ];
      setPatterns(mockPatterns);
    }
  }, [providers, clinicTypes, patterns.length]);

  const getPatternDescription = (pattern: RecurringPattern) => {
    const startDateFormatted = format(pattern.startDate, "MMM d, yyyy");
    const endDateFormatted = pattern.endDate
      ? format(pattern.endDate, "MMM d, yyyy")
      : "No end date";

    let patternText = "";
    switch (pattern.pattern) {
      case "daily":
        patternText = "Daily";
        break;
      case "weekly":
        patternText = "Weekly";
        break;
      case "biweekly":
        patternText = "Biweekly";
        break;
      default:
        patternText = pattern.pattern;
    }

    return `${patternText} recurring shift from ${startDateFormatted} to ${endDateFormatted}, ${pattern.startTime} to ${pattern.endTime}${pattern.location ? ` at ${pattern.location}` : ""}`;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate API call to refresh data
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text("Recurring Shift Patterns Report", 14, 22);

    // Add generation date
    doc.setFontSize(10);
    doc.text(
      `Generated on: ${format(new Date(), "MMMM d, yyyy, h:mm a")}`,
      14,
      30,
    );

    // Define the columns for the table
    const tableColumn = [
      "Provider",
      "Clinic Type",
      "Pattern",
      "Date Range",
      "Time",
      "Location",
      "Notes",
    ];

    // Define the rows for the table
    const tableRows = patterns.map((pattern) => [
      pattern.providerName,
      pattern.clinicTypeName,
      pattern.pattern.charAt(0).toUpperCase() + pattern.pattern.slice(1),
      `${format(pattern.startDate, "MM/dd/yyyy")} - ${pattern.endDate ? format(pattern.endDate, "MM/dd/yyyy") : "No end date"}`,
      `${pattern.startTime} - ${pattern.endTime}`,
      pattern.location || "",
      pattern.notes || "",
    ]);

    // Generate the table
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 40,
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { cellWidth: 30 }, 6: { cellWidth: 40 } },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      alternateRowStyles: { fillColor: [240, 240, 240] },
      margin: { top: 40 },
    });

    // Save the PDF
    doc.save("recurring-shift-patterns.pdf");
  };

  const printReport = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const html = `
      <html>
        <head>
          <title>Recurring Shift Patterns</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            h1 { color: #333; }
            .date { color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th { background-color: #2980b9; color: white; text-align: left; padding: 8px; }
            td { border: 1px solid #ddd; padding: 8px; }
            tr:nth-child(even) { background-color: #f2f2f2; }
            .provider-color { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 5px; }
          </style>
        </head>
        <body>
          <h1>Recurring Shift Patterns Report</h1>
          <div class="date">Generated on: ${format(new Date(), "MMMM d, yyyy, h:mm a")}</div>
          <table>
            <thead>
              <tr>
                <th>Provider</th>
                <th>Clinic Type</th>
                <th>Pattern</th>
                <th>Date Range</th>
                <th>Time</th>
                <th>Location</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              ${patterns
                .map(
                  (pattern) => `
                <tr>
                  <td>
                    <span class="provider-color" style="background-color: ${pattern.providerColor};"></span>
                    ${pattern.providerName}
                  </td>
                  <td>
                    <span class="provider-color" style="background-color: ${pattern.clinicTypeColor};"></span>
                    ${pattern.clinicTypeName}
                  </td>
                  <td>${pattern.pattern.charAt(0).toUpperCase() + pattern.pattern.slice(1)}</td>
                  <td>${format(pattern.startDate, "MM/dd/yyyy")} - ${pattern.endDate ? format(pattern.endDate, "MM/dd/yyyy") : "No end date"}</td>
                  <td>${pattern.startTime} - ${pattern.endTime}</td>
                  <td>${pattern.location || ""}</td>
                  <td>${pattern.notes || ""}</td>
                </tr>
              `,
                )
                .join("")}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl font-bold">
          Recurring Shift Patterns
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-8"
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={printReport}
            className="h-8"
          >
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={generatePDF}
            className="h-8"
          >
            <Download className="h-4 w-4 mr-1" />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Patterns</TabsTrigger>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="biweekly">Biweekly</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {patterns.length > 0 ? (
              patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="p-4 border rounded-md flex items-start space-x-3"
                >
                  <div
                    className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: pattern.providerColor }}
                  />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-medium">{pattern.providerName}</h3>
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{
                          backgroundColor: pattern.clinicTypeColor,
                          color: "white",
                          opacity: 0.8,
                        }}
                      >
                        {pattern.clinicTypeName}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {getPatternDescription(pattern)}
                    </p>
                    {pattern.notes && (
                      <p className="text-xs text-gray-500 mt-2">
                        Notes: {pattern.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No recurring shift patterns found
              </div>
            )}
          </TabsContent>

          {["daily", "weekly", "biweekly"].map((patternType) => (
            <TabsContent
              key={patternType}
              value={patternType}
              className="space-y-4"
            >
              {patterns.filter((p) => p.pattern === patternType).length > 0 ? (
                patterns
                  .filter((p) => p.pattern === patternType)
                  .map((pattern) => (
                    <div
                      key={pattern.id}
                      className="p-4 border rounded-md flex items-start space-x-3"
                    >
                      <div
                        className="w-4 h-4 rounded-full mt-1 flex-shrink-0"
                        style={{ backgroundColor: pattern.providerColor }}
                      />
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="font-medium">
                            {pattern.providerName}
                          </h3>
                          <span
                            className="px-2 py-1 text-xs rounded-full"
                            style={{
                              backgroundColor: pattern.clinicTypeColor,
                              color: "white",
                              opacity: 0.8,
                            }}
                          >
                            {pattern.clinicTypeName}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {getPatternDescription(pattern)}
                        </p>
                        {pattern.notes && (
                          <p className="text-xs text-gray-500 mt-2">
                            Notes: {pattern.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No {patternType} recurring shift patterns found
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecurringShiftPatterns;
