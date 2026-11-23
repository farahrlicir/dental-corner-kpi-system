
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MonthlyReportData {
  id: string;
  assistant: string;
  month: string;
  evaluationCount: number;
  averageScore: number | null;
  kpiScores: {
    criterionName: string;
    averageWeight: number;
    averageScore: number;
  }[];
  observations: string[];
}

export function generateMonthlyReport(report: MonthlyReportData) {
  const doc = new jsPDF();

  const monthLabel = new Date(
    `${report.month}-01T00:00:00`
  ).toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  doc.setFillColor(36, 91, 134);
  doc.rect(0, 0, 210, 38, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(19);
  doc.text("DENTAL CLINIC", 15, 16);

  doc.setFontSize(11);
  doc.text("Monthly Assistant Performance Report", 15, 27);

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.text(`Assistant: ${report.assistant}`, 15, 51);
  doc.text(`Reporting Period: ${monthLabel}`, 15, 59);

  doc.setFillColor(240, 246, 251);
  doc.roundedRect(15, 70, 180, 28, 3, 3, "F");

  doc.setFontSize(10);
  doc.text("FINAL PERFORMANCE SCORE", 22, 81);

  doc.setFontSize(20);
  doc.setTextColor(36, 91, 134);
  doc.text(
    report.averageScore === null
      ? "N/A"
      : `${report.averageScore.toFixed(1)}%`,
    22,
    92
  );

  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(`Evaluations: ${report.evaluationCount}`, 120, 87);

  autoTable(doc, {
    startY: 108,
    head: [["KPI Criterion", "Weight", "Performance"]],
    body: report.kpiScores.map((criterion) => [
      criterion.criterionName,
      `${criterion.averageWeight.toFixed(1)}%`,
      `${criterion.averageScore.toFixed(1)}%`,
    ]),
    theme: "grid",
    headStyles: {
      fillColor: [36, 91, 134],
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    margin: {
      left: 15,
      right: 15,
    },
  });

  const finalY =
    (doc as jsPDF & { lastAutoTable?: { finalY: number } })
      .lastAutoTable?.finalY ?? 108;

  let observationY = finalY + 12;

  if (observationY > 255) {
    doc.addPage();
    observationY = 20;
  }

  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Performance Observations", 15, observationY);

  doc.setFontSize(9);

  if (report.observations.length === 0) {
    doc.text("No observations recorded.", 15, observationY + 9);
  } else {
    report.observations.forEach((observation, index) => {
      const lines = doc.splitTextToSize(
        `${index + 1}. ${observation}`,
        175
      );

      if (observationY + lines.length * 5 + 9 > 275) {
        doc.addPage();
        observationY = 20;
      }

      doc.text(lines, 15, observationY + 9);
      observationY += lines.length * 5 + 5;
    });
  }

  const pageCount = doc.getNumberOfPages();

  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setFontSize(8);
    doc.setTextColor(120, 130, 140);
    doc.text(
      "Confidential - Assistant Performance Report",
      15,
      287
    );
    doc.text(`Page ${page} of ${pageCount}`, 180, 287);
  }

  const safeName = report.assistant.replace(/[^a-z0-9]/gi, "_");

  doc.save(`Monthly_Report_${safeName}_${report.month}.pdf`);
}
