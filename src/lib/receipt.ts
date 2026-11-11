import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface DonationReceiptData {
  receiptNumber: string;
  transactionId?: string | null;
  date: string;
  donorName: string;
  donorPhone: string;
  donorEmail?: string | null;
  donorPan?: string | null;
  gotra?: string | null;
  donorAddress?: string | null;
  categoryName: string;
  amount: number;
  paymentMethod: string;
  isTaxExempt80G?: boolean;
  tax80GNumber?: string | null;
  templeName?: string;
  trustName?: string;
  trustRegNumber?: string;
  templeAddress?: string;
}

export interface SevaPassData {
  bookingNumber: string;
  devoteeName: string;
  devoteePhone: string;
  gotra?: string | null;
  nakshatra?: string | null;
  sankalpa?: string | null;
  familyMembers?: string | null;
  sevaName: string;
  deityName: string;
  bookingDate: string;
  timeSlot: string;
  numberOfPeople: number;
  amountPaid: number;
  specialInstructions?: string | null;
}

export function numberToWords(num: number): string {
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen "
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  if ((num = num.toString().length > 9 ? parseFloat(num.toString().substring(0, 9)) : num) == 0) return "Zero Rupees Only";
  const n = ("000000000" + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
  if (!n) return `${num} Rupees Only`;

  let str = "";
  str += Number(n[1]) != 0 ? (a[Number(n[1])] || b[Number(n[1][0])] + " " + a[Number(n[1][1])]) + "Crore " : "";
  str += Number(n[2]) != 0 ? (a[Number(n[2])] || b[Number(n[2][0])] + " " + a[Number(n[2][1])]) + "Lakh " : "";
  str += Number(n[3]) != 0 ? (a[Number(n[3])] || b[Number(n[3][0])] + " " + a[Number(n[3][1])]) + "Thousand " : "";
  str += Number(n[4]) != 0 ? (a[Number(n[4])] || b[Number(n[4][0])] + " " + a[Number(n[4][1])]) + "Hundred " : "";
  str += Number(n[5]) != 0 ? ((str != "" ? "and " : "") + (a[Number(n[5])] || b[Number(n[5][0])] + " " + a[Number(n[5][1])])) : "";
  return str.trim() + " Rupees Only";
}

/**
 * Generate PDF Donation Receipt
 */
export function generateDonationReceiptPDF(data: DonationReceiptData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const temple = data.templeName || "SHRI RAM JANMABHOOMI & MAHADEV MANDIR";
  const trust = data.trustName || "Shri Ram Mahadev Mandir Charitable Trust (Regd.)";
  const trustReg = data.trustRegNumber || "TRUST/UP/AYD/2020/00482";
  const templeAddr = data.templeAddress || "Ramkot, Ayodhya Dham, Uttar Pradesh - 224123, India";

  // Decorative border
  doc.setDrawColor(123, 17, 19); // Sacred Maroon
  doc.setLineWidth(1.5);
  doc.rect(8, 8, 194, 281);
  doc.setDrawColor(229, 138, 19); // Sacred Gold
  doc.setLineWidth(0.5);
  doc.rect(10, 10, 190, 277);

  // Header Banner
  doc.setFillColor(123, 17, 19);
  doc.rect(10, 10, 190, 36, "F");

  doc.setTextColor(255, 235, 180);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(temple, 105, 22, { align: "center" });

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(255, 255, 255);
  doc.text(`${trust} | Reg. No: ${trustReg}`, 105, 30, { align: "center" });
  doc.setFontSize(8);
  doc.text(templeAddr, 105, 36, { align: "center" });

  // Receipt Title Badge
  doc.setFillColor(229, 138, 19);
  doc.roundedRect(65, 50, 80, 10, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("OFFICIAL DONATION RECEIPT", 105, 57, { align: "center" });

  // Top Metadata
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Receipt No: ${data.receiptNumber}`, 16, 70);
  doc.text(`Date: ${data.date}`, 145, 70);

  if (data.transactionId) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(`Txn Ref: ${data.transactionId}`, 16, 76);
    doc.text(`Payment Mode: ${data.paymentMethod}`, 145, 76);
  }

  // Donor Details Table
  autoTable(doc, {
    startY: 82,
    head: [["PARTICULARS", "DEVOTEE / DONOR DETAILS"]],
    body: [
      ["Donor Name", data.donorName],
      ["Contact Phone", data.donorPhone],
      ["Email Address", data.donorEmail || "N/A"],
      ["Gotra (गोत्र)", data.gotra || "Kashyapa / Swagotra"],
      ["Address", data.donorAddress || "N/A"],
      ["PAN Number", data.donorPan ? data.donorPan.toUpperCase() : "N/A (General Devotee)"],
      ["Donation Purpose / Seva", data.categoryName],
      ["Amount Contributed", `INR ${data.amount.toLocaleString("en-IN")}/-`],
      ["Amount in Words", numberToWords(data.amount)],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [123, 17, 19],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 55 },
      1: { cellWidth: 125 },
    },
    margin: { left: 15, right: 15 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // 80G Tax Exemption Section
  if (data.isTaxExempt80G && data.tax80GNumber) {
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(217, 119, 6);
    doc.roundedRect(15, finalY, 180, 24, 2, 2, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(146, 64, 14);
    doc.text("INCOME TAX BENEFIT UNDER SECTION 80G", 20, finalY + 7);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(55, 65, 81);
    doc.text(
      `Donation is eligible for deduction under Section 80G(5)(vi) of the Income Tax Act, 1961.`,
      20,
      finalY + 13
    );
    doc.text(`Approval / Order Number: ${data.tax80GNumber}`, 20, finalY + 18);
  }

  // Stamp and Signatures
  const footerY = finalY + (data.isTaxExempt80G ? 35 : 15);

  doc.setDrawColor(200, 200, 200);
  doc.line(15, footerY + 25, 65, footerY + 25);
  doc.line(140, footerY + 25, 190, footerY + 25);

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text("Authorized Incharge / Pujari", 40, footerY + 30, { align: "center" });
  doc.text("Trustee / Chief Treasurer", 165, footerY + 30, { align: "center" });

  // Divine Blessing Note
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(123, 17, 19);
  doc.text(
    "॥ सर्वे भवन्तु सुखिनः सर्वे सन्तु निरामयाः । सर्वे भद्राणि पश्यन्तु मा कश्चिद्दुःखभाग्भवेत् ॥",
    105,
    footerY + 45,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(140, 140, 140);
  doc.text("This is an electronically generated and verified receipt. No physical signature required.", 105, 280, {
    align: "center",
  });

  return doc;
}

/**
 * Generate PDF Seva Pass
 */
export function generateSevaPassPDF(data: SevaPassData): jsPDF {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a5",
  });

  // Border
  doc.setDrawColor(123, 17, 19);
  doc.setLineWidth(1.2);
  doc.rect(6, 6, 136, 198);

  // Header
  doc.setFillColor(123, 17, 19);
  doc.rect(6, 6, 136, 26, "F");

  doc.setTextColor(255, 235, 180);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("SHRI RAM & MAHADEV MANDIR", 74, 16, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("Official Seva Booking & Sankalpa Pass", 74, 24, { align: "center" });

  // Pass Number
  doc.setTextColor(30, 41, 59);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text(`Pass No: ${data.bookingNumber}`, 12, 40);
  doc.text(`Date: ${data.bookingDate}`, 90, 40);

  // Table
  autoTable(doc, {
    startY: 46,
    head: [["SEVA / PUJA DETAILS", ""]],
    body: [
      ["Sacred Seva", data.sevaName],
      ["Deity", data.deityName],
      ["Reserved Slot", data.timeSlot],
      ["Yajaman (Devotee)", data.devoteeName],
      ["Gotra (गोत्र)", data.gotra || "Swagotra"],
      ["Nakshatra", data.nakshatra || "N/A"],
      ["Participants", `${data.numberOfPeople} Person(s)`],
      ["Sankalpa", data.sankalpa || "Loka Kalyana & Family Prosperity"],
      ["Dakshina Paid", `INR ${data.amountPaid}/- (Confirmed)`],
    ],
    theme: "grid",
    headStyles: { fillColor: [123, 17, 19] },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40 }, 1: { cellWidth: 80 } },
    margin: { left: 12, right: 12 },
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(7.5);
  doc.setTextColor(120, 50, 20);
  doc.text("Important: Please report to the Pujari desk 15 minutes before slot with this pass.", 74, finalY, {
    align: "center",
  });
  doc.text("Traditional attire (Dhoti-Kurta / Saree) is recommended for sanctum abhishek.", 74, finalY + 6, {
    align: "center",
  });

  return doc;
}
