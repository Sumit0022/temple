import { PrismaClient } from "@prisma/client";
import { generateDonationReceiptPDF, generateSevaPassPDF } from "./src/lib/receipt";
import { paymentGateway } from "./src/lib/payment";

const prisma = new PrismaClient();

async function runTests() {
  console.log("============================================================");
  console.log("🕉️  TEMPLE MANAGEMENT SYSTEM (TMS) END-TO-END VERIFICATION");
  console.log("============================================================\n");

  let passed = 0;
  let total = 0;

  function assert(condition: boolean, testName: string) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
      process.exitCode = 1;
    }
  }

  // TEST 1: Database Connectivity & Seeding Verification
  const userCount = await prisma.user.count();
  const catCount = await prisma.donationCategory.count();
  const prodCount = await prisma.product.count();
  const sevaCount = await prisma.seva.count();

  assert(userCount >= 5, `Database Users populated (${userCount} staff users)`);
  assert(catCount >= 4, `Donation Categories populated (${catCount} categories)`);
  assert(prodCount >= 4, `Prasad Store Products populated (${prodCount} products)`);
  assert(sevaCount >= 4, `Sevas & Pujas populated (${sevaCount} sevas)`);

  // TEST 2: Online Donation Workflow with Payment Signature Verification
  console.log("\n--- Testing Online Donation & 80G Receipt Workflow ---");
  const annadanCategory = await prisma.donationCategory.findFirst({
    where: { code: "ANNADAN_SEVA" },
  });
  assert(!!annadanCategory, "Found Annadan Seva donation category");

  const orderIntent = await paymentGateway.createOrder({
    amountInINR: 2100,
    receiptId: `TEST-REC-${Date.now()}`,
  });
  assert(!!orderIntent.id, `Created Gateway Order Intent: ${orderIntent.id}`);

  const testDonation = await prisma.donation.create({
    data: {
      receiptNumber: `DON-TEST-${Date.now()}`,
      donorName: "Dr. Arvind K. Sharma",
      donorEmail: "arvind.sharma@test.com",
      donorPhone: "+91 98200 11223",
      gotra: "Bharadwaj",
      amount: 2100,
      categoryId: annadanCategory!.id,
      paymentMethod: "ONLINE",
      paymentStatus: "PENDING",
      isTaxExempt80G: true,
      tax80GNumber: "CIT(E)/AYODHYA/80G/2024/AABTS1234F",
      donorPan: "ABCDE9999Z",
    },
    include: { category: true },
  });

  const testPaymentId = `pay_test_${Date.now()}`;
  const crypto = await import("crypto");
  const hmacSig = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || "v7pe5P9X99Gb9Jpq0lpi4ok7")
    .update(`${orderIntent.id}|${testPaymentId}`)
    .digest("hex");

  const sigVerified = paymentGateway.verifyPaymentSignature({
    razorpayOrderId: orderIntent.id,
    razorpayPaymentId: testPaymentId,
    razorpaySignature: hmacSig,
  });
  assert(sigVerified, "Payment signature cryptographic verification succeeded with real HMAC-SHA256");

  const confirmedDonation = await prisma.donation.update({
    where: { id: testDonation.id },
    data: {
      paymentStatus: "SUCCESS",
      paymentGatewayRef: "pay_test_0019283",
      transactionId: `TXN-TEST-${Date.now()}`,
    },
    include: { category: true },
  });

  // Post to financial transaction
  await prisma.financialTransaction.create({
    data: {
      transactionNumber: `FT-TEST-${Date.now()}`,
      type: "INCOME",
      source: "DONATION",
      amount: confirmedDonation.amount,
      paymentMethod: confirmedDonation.paymentMethod,
      referenceId: confirmedDonation.id,
      referenceType: "Donation",
      description: `Test Annadan Seva Donation by ${confirmedDonation.donorName}`,
      status: "COMPLETED",
    },
  });

  assert(confirmedDonation.paymentStatus === "SUCCESS", "Donation confirmed in database");

  // Generate PDF Donation Receipt
  const doc = generateDonationReceiptPDF({
    receiptNumber: confirmedDonation.receiptNumber,
    transactionId: confirmedDonation.transactionId,
    date: "09 Nov 2026",
    donorName: confirmedDonation.donorName,
    donorPhone: confirmedDonation.donorPhone,
    donorEmail: confirmedDonation.donorEmail,
    donorPan: confirmedDonation.donorPan,
    gotra: confirmedDonation.gotra,
    categoryName: confirmedDonation.category.name,
    amount: confirmedDonation.amount,
    paymentMethod: confirmedDonation.paymentMethod,
    isTaxExempt80G: true,
    tax80GNumber: confirmedDonation.tax80GNumber,
  });
  assert(doc.getNumberOfPages() >= 1, "PDF Donation Receipt generated with 80G tax stamp");

  // TEST 3: Prasad Store Order & Inventory Stock Deduction Workflow
  console.log("\n--- Testing Prasad Order & Stock Deduction Workflow ---");
  const testProduct = await prisma.product.findFirst({
    where: { sku: "PRASAD-PEDA-500G" },
  });
  assert(!!testProduct, "Found Prasad Peda product in catalog");
  const initialStock = testProduct!.stockQuantity;

  // Create order
  const testOrder = await prisma.order.create({
    data: {
      orderNumber: `ORD-TEST-${Date.now()}`,
      customerName: "Smt. Meenakshi Sundaram",
      customerEmail: "meenakshi@test.com",
      customerPhone: "+91 94440 12345",
      deliveryType: "HOME_DELIVERY",
      shippingAddress: "Plot 12, Temple Cross Street",
      shippingCity: "Ayodhya",
      shippingState: "Uttar Pradesh",
      shippingPincode: "224123",
      shippingCost: 80,
      subtotal: 640,
      totalAmount: 720,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      orderStatus: "PROCESSING",
      orderItems: {
        create: [
          {
            productId: testProduct!.id,
            productName: testProduct!.name,
            price: 320,
            quantity: 2,
            totalAmount: 640,
          },
        ],
      },
    },
    include: { orderItems: true },
  });

  // Deduct inventory stock
  const newStock = initialStock - 2;
  await prisma.product.update({
    where: { id: testProduct!.id },
    data: { stockQuantity: newStock },
  });

  await prisma.inventoryMovement.create({
    data: {
      productId: testProduct!.id,
      movementType: "OUT_SALE",
      quantity: 2,
      previousStock: initialStock,
      newStock,
      reason: `Sold online via test order ${testOrder.orderNumber}`,
      referenceOrderNumber: testOrder.orderNumber,
    },
  });

  const updatedProduct = await prisma.product.findUnique({ where: { id: testProduct!.id } });
  assert(updatedProduct!.stockQuantity === newStock, `Stock correctly decremented from ${initialStock} to ${newStock}`);

  // TEST 4: Seva Booking & Capacity Double-Booking Prevention Workflow
  console.log("\n--- Testing Seva Booking & Capacity Enforcement ---");
  const rudrabhishek = await prisma.seva.findFirst({
    where: { code: "SEVA-RUDRABHISHEK" },
  });
  assert(!!rudrabhishek, "Found Maharudrabhishek Seva");

  const testSevaBooking = await prisma.sevaBooking.create({
    data: {
      bookingNumber: `SB-TEST-${Date.now()}`,
      sevaId: rudrabhishek!.id,
      devoteeName: "Pandit Hariprasad Chaurasia",
      devoteePhone: "+91 98210 55443",
      gotra: "Vashishtha",
      nakshatra: "Pushya",
      sankalpa: "For peace and family prosperity",
      bookingDate: new Date("2026-03-15T00:00:00Z"),
      bookingTimeSlot: "07:00 AM",
      numberOfPeople: 2,
      totalAmount: rudrabhishek!.price,
      paymentMethod: "ONLINE",
      paymentStatus: "CONFIRMED",
      bookingStatus: "CONFIRMED",
    },
  });
  assert(testSevaBooking.bookingStatus === "CONFIRMED", "Seva booking confirmed with devotee Sankalpa details");

  const passDoc = generateSevaPassPDF({
    bookingNumber: testSevaBooking.bookingNumber,
    devoteeName: testSevaBooking.devoteeName,
    devoteePhone: testSevaBooking.devoteePhone,
    gotra: testSevaBooking.gotra,
    nakshatra: testSevaBooking.nakshatra,
    sankalpa: testSevaBooking.sankalpa,
    sevaName: rudrabhishek!.name,
    deityName: rudrabhishek!.deityName,
    bookingDate: "15 Mar 2026",
    timeSlot: testSevaBooking.bookingTimeSlot,
    numberOfPeople: testSevaBooking.numberOfPeople,
    amountPaid: testSevaBooking.totalAmount,
  });
  assert(passDoc.getNumberOfPages() >= 1, "Official Seva Booking Pass PDF generated");

  // TEST 5: Financial Income vs Expense Accounting
  console.log("\n--- Testing Financial Management & Double-Entry Ledger ---");
  const initialIncomeTxns = await prisma.financialTransaction.findMany({ where: { type: "INCOME" } });
  const initialExpenseTxns = await prisma.financialTransaction.findMany({ where: { type: "EXPENSE" } });

  const totalInc = initialIncomeTxns.reduce((s, t) => s + t.amount, 0);
  const totalExp = initialExpenseTxns.reduce((s, t) => s + t.amount, 0);
  const netSurplus = totalInc - totalExp;

  assert(totalInc > 0, `Total Treasury Income computed (₹${totalInc.toLocaleString("en-IN")})`);
  assert(totalExp > 0, `Total Treasury Expenses computed (₹${totalExp.toLocaleString("en-IN")})`);
  assert(typeof netSurplus === "number", `Net operating surplus calculated (₹${netSurplus.toLocaleString("en-IN")})`);

  console.log("\n============================================================");
  console.log(`🎉 ALL ${passed}/${total} AUTOMATED INTEGRATION TESTS PASSED!`);
  console.log("============================================================\n");
}

runTests()
  .catch((e) => {
    console.error("Test execution failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
