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
    downloadTextSummary(chiefComplaint, history, recommendation);
    return;
  }

  try {
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

    const timestamp = new Date().toISOString().slice(0, 10);
    pdf.save(`MedPath_AI_Clinical_Summary_${timestamp}.pdf`);
  } catch (error) {
    console.error("Failed to generate PDF canvas, falling back to text download", error);
    downloadTextSummary(chiefComplaint, history, recommendation);
  }
}

export function triggerBrowserPrint() {
  window.print();
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

  let content = `======================================================================\n`;
  content += `           تقرير الفرز والتوجيه الطبي السريري - MedPath AI             \n`;
  content += `       نظام التوجيه الذكي وفق المعايير واللوائح الصحية الرقمية السعودية  \n`;
  content += `======================================================================\n`;
  content += `تاريخ التقرير: ${dateStr}\n`;
  content += `تصنيف الفرز: ${recommendation.triageLevelLabel}\n\n`;

  content += `[1] التوقيت الموصى به للمراجعة (Recommended Appointment Timeline):\n`;
  content += `----------------------------------------------------------------------\n`;
  content += `${recommendation.appointmentTimeline}\n\n`;

  content += `[2] العيادة والتخصص الطبي المستهدف (Target Medical Specialty):\n`;
  content += `----------------------------------------------------------------------\n`;
  content += `• التخصص الطبي: ${recommendation.targetSpecialty.specialtyName}\n`;
  content += `• نوع القسم/المنشأة: ${recommendation.targetSpecialty.departmentType}\n`;
  content += `• مسار المنظومة السعودية: ${recommendation.targetSpecialty.saudiHealthcareRouting}\n`;
  content += `• نطاق الفحص السريري: ${recommendation.targetSpecialty.clinicalFocus}\n\n`;

  content += `[3] إرشادات السلامة ما قبل الاستشارة (Pre-Consultation Safety Directives):\n`;
  content += `----------------------------------------------------------------------\n`;
  content += `أولاً: ما يجب فعله أثناء الانتظار (DO):\n`;
  recommendation.safetyDirectives.dos.forEach((item, idx) => {
    content += `  ${idx + 1}. ${item}\n`;
  });
  content += `\nثانياً: ما يجب تجنبه والامتناع عنه (DON'T):\n`;
  recommendation.safetyDirectives.donts.forEach((item, idx) => {
    content += `  ${idx + 1}. ${item}\n`;
  });
  content += `\n`;

  content += `[4] الملخص السريري للطبيب المعالج (Printable Clinical Summary for Physician):\n`;
  content += `----------------------------------------------------------------------\n`;
  content += `• ملخص الشكوى: ${recommendation.clinicalSummary.chiefComplaintSummary}\n`;
  content += `• التسلسل الزمني للأعراض (HPI): ${recommendation.clinicalSummary.hpiTimeline}\n`;
  content += `• الأعراض المرصودة:\n`;
  recommendation.clinicalSummary.reportedSymptoms.forEach((sym) => {
    content += `  - ${sym}\n`;
  });
  content += `• عوامل الخطورة/النفي السريري:\n`;
  recommendation.clinicalSummary.pertinentNegativesOrRiskFactors.forEach((neg) => {
    content += `  - ${neg}\n`;
  });
  content += `• ملاحظات تقنية للطبيب المعالج:\n${recommendation.clinicalSummary.clinicalNotesForPhysician}\n\n`;

  if (history.length > 0) {
    content += `[5] تفاصيل استجابات المريض لأسئلة التقييم التوضيحية:\n`;
    content += `----------------------------------------------------------------------\n`;
    history.forEach((qa, idx) => {
      content += `س${idx + 1}: ${qa.question}\n`;
      content += `ج: ${qa.selectedOption}${qa.customDetails ? ` [تفاصيل: ${qa.customDetails}]` : ""}\n`;
    });
    content += `\n`;
  }

  content += `======================================================================\n`;
  content += `الإقرارات التنظيمية والامتثال القانوني:\n`;
  content += `• حماية البيانات (SDAIA PDPL): ${recommendation.regulatoryCompliance.sdaiaPdplNotice}\n`;
  content += `• السلامة الطبية (SFDA SaMD): ${recommendation.regulatoryCompliance.sfdaSamdNotice}\n`;
  content += `• المعايير الإرشادية (Saudi MOH): ${recommendation.regulatoryCompliance.mohFramework}\n`;
  content += `======================================================================\n`;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `MedPath_AI_Clinical_Summary_${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

