import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { FinalRecommendationResponse, QAPair } from "../types";

export async function generateVisitSummaryPDF(
  elementId: string,
  chiefComplaint: string,
  history: QAPair[],
  recommendation: FinalRecommendationResponse
) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error("Element not found for PDF export");
    return;
  }

  try {
    // Clone or capture element with high scale
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`ملخص_زيارة_MedPath_AI_${new Date().toISOString().slice(0, 10)}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF canvas, falling back to print/text download", error);
    // Fallback: create text file
    downloadTextSummary(chiefComplaint, history, recommendation);
  }
}

export function downloadTextSummary(
  chiefComplaint: string,
  history: QAPair[],
  recommendation: FinalRecommendationResponse
) {
  const dateStr = new Date().toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let content = `=================================================\n`;
  content += `           تقرير ملخص التوجيه الطبي - MedPath AI          \n`;
  content += `=================================================\n`;
  content += `تاريخ التقرير: ${dateStr}\n\n`;

  content += `1. الشكوى الرئيسية الأولية:\n`;
  content += `-------------------------\n`;
  content += `${chiefComplaint}\n\n`;

  content += `2. التفاصيل والأسئلة الإضافية:\n`;
  content += `-----------------------------\n`;
  history.forEach((qa, idx) => {
    content += `س${idx + 1}: ${qa.question}\n`;
    content += `ج: ${qa.selectedOption}${qa.customDetails ? ` (${qa.customDetails})` : ""}\n\n`;
  });

  content += `3. التوصية بالموعد والعيادة:\n`;
  content += `-------------------------\n`;
  content += `الموعد المناسب: ${recommendation.recommendedTiming}\n`;
  content += `العيادة والتخصص: ${recommendation.clinicInfo.clinicName}\n`;
  content += `الطبيب المقترح: ${recommendation.clinicInfo.doctorName}\n`;
  content += `مزايا العيادة:\n`;
  recommendation.clinicInfo.clinicFeatures.forEach((feat) => {
    content += `  - ${feat}\n`;
  });
  content += `مسار الوصول: ${recommendation.clinicInfo.clinicPath}\n\n`;

  content += `4. إرشادات ما قبل وأثناء الزيارة:\n`;
  content += `---------------------------------\n`;
  content += `أثناء الانتظار:\n`;
  recommendation.patientGuidance.whileWaiting.forEach((item) => {
    content += `  • ${item}\n`;
  });
  content += `أمور يجب تجنبها:\n`;
  recommendation.patientGuidance.thingsToAvoid.forEach((item) => {
    content += `  • ${item}\n`;
  });

  content += `\n-------------------------------------------------\n`;
  content += `إخلاء مسؤولية: ${recommendation.disclaimer}\n`;
  content += `=================================================\n`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ملخص_MedPath_AI_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
