import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Temple Management System comprehensive database seed...");

  // 1. CLEAN EXISTING DATA (Safe cascade order)
  await prisma.auditLog.deleteMany();
  await prisma.financialTransaction.deleteMany();
  await prisma.inventoryMovement.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.productCategory.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.expenseCategory.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.sevaBooking.deleteMany();
  await prisma.seva.deleteMany();
  await prisma.sevaCategory.deleteMany();
  await prisma.eventRegistration.deleteMany();
  await prisma.event.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.galleryAlbum.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.donationCategory.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.templeSetting.deleteMany();
  await prisma.devotee.deleteMany();
  await prisma.user.deleteMany();

  // 2. CREATE ADMINISTRATIVE & STAFF USERS
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash("Admin@Mandir2026!", salt);
  const staffPasswordHash = await bcrypt.hash("Staff@Mandir2026!", salt);

  const superAdmin = await prisma.user.create({
    data: {
      email: "admin@mandir.org",
      name: "Mahant Acharya Ramswaroop Ji",
      role: "SUPER_ADMIN",
      phone: "+91 98765 00001",
      passwordHash: adminPasswordHash,
      isActive: true,
    },
  });

  const templeAdmin = await prisma.user.create({
    data: {
      email: "trustee@mandir.org",
      name: "Shri Rajeshwar Verma (Trust Secretary)",
      role: "TEMPLE_ADMIN",
      phone: "+91 98765 00002",
      passwordHash: staffPasswordHash,
      isActive: true,
    },
  });

  const accountant = await prisma.user.create({
    data: {
      email: "accounts@mandir.org",
      name: "Shri Shyam Sundar Gupta (Chief Auditor)",
      role: "ACCOUNTANT",
      phone: "+91 98765 00003",
      passwordHash: staffPasswordHash,
      isActive: true,
    },
  });

  const donationManager = await prisma.user.create({
    data: {
      email: "donation@mandir.org",
      name: "Pandit Keshav Shastri (Donation Incharge)",
      role: "DONATION_MANAGER",
      phone: "+91 98765 00004",
      passwordHash: staffPasswordHash,
      isActive: true,
    },
  });

  const storeManager = await prisma.user.create({
    data: {
      email: "store@mandir.org",
      name: "Mukesh Sharma (Prasad & Bhandar Sevadar)",
      role: "STORE_MANAGER",
      phone: "+91 98765 00005",
      passwordHash: staffPasswordHash,
      isActive: true,
    },
  });

  const sevaManager = await prisma.user.create({
    data: {
      email: "seva@mandir.org",
      name: "Pandit Dinesh Tiwari (Head Pujari & Seva Co-ordinator)",
      role: "SEVA_MANAGER",
      phone: "+91 98765 00006",
      passwordHash: staffPasswordHash,
      isActive: true,
    },
  });

  const generalStaff = await prisma.user.create({
    data: {
      email: "staff@mandir.org",
      name: "Gopal Krishna (Reception & Information Desk)",
      role: "GENERAL_STAFF",
      phone: "+91 98765 00007",
      passwordHash: staffPasswordHash,
      isActive: true,
    },
  });

  console.log("✓ Administrative and staff roles initialized.");

  // 3. CREATE SAMPLE REGISTERED DEVOTEE
  const devoteePasswordHash = await bcrypt.hash("Devotee@Mandir2026!", salt);
  const devotee1 = await prisma.devotee.create({
    data: {
      name: "Amitabh R. Srivastava",
      email: "devotee@example.com",
      phone: "+91 98111 22334",
      passwordHash: devoteePasswordHash,
      gotra: "Kashyapa (कश्यप)",
      nakshatra: "Rohini (रोहिणी)",
      rashi: "Vrishabha (वृषभ)",
      address: "B-42, Ayodhya Marg, Civil Lines",
      city: "Lucknow",
      state: "Uttar Pradesh",
      pincode: "226001",
      panNumber: "ABCDE1234F",
      isGuest: false,
    },
  });

  // 4. DONATION CATEGORIES
  const catGeneral = await prisma.donationCategory.create({
    data: {
      name: "General Temple Fund",
      nameHi: "सामान्य मंदिर कोष",
      code: "GENERAL_FUND",
      description: "Supports daily temple worship, electricity, maintenance, security, and priest stipends.",
      descriptionHi: "दैनिक पूजा-अर्चना, मंदिर रख-रखाव, सुरक्षा, एवं पुजारियों के मानदेय हेतु सहयोग।",
      icon: "Shield",
      isTaxExempt: true,
      minAmount: 101,
      sortOrder: 1,
    },
  });

  const catAnnadan = await prisma.donationCategory.create({
    data: {
      name: "Daily Annadan Mahaprasad Seva",
      nameHi: "नित्य अन्नदान महाप्रसाद सेवा",
      code: "ANNADAN_SEVA",
      description: "Feed thousands of pilgrims, sadhus, and underprivileged devotees pure satvik meals daily.",
      descriptionHi: "प्रतिदिन हजारों तीर्थयात्रियों, साधु-संतों एवं जरूरतमंदों को निःशुल्क पवित्र सात्विक भोजन।",
      icon: "Utensils",
      isTaxExempt: true,
      minAmount: 251,
      sortOrder: 2,
    },
  });

  const catRenovation = await prisma.donationCategory.create({
    data: {
      name: "Temple Development & Golden Shikhara",
      nameHi: "मंदिर विस्तार एवं स्वर्ण शिखर निर्माण",
      code: "TEMPLE_DEV",
      description: "Carved stone architecture, marble sanctum expansion, and golden dome craftsmanship.",
      descriptionHi: "प्राचीन भारतीय वास्तुशिल्प अनुसार नक्काशीदार पत्थर, गर्भगृह विस्तार एवं स्वर्ण शिखर कार्य।",
      icon: "Sparkles",
      isTaxExempt: true,
      minAmount: 501,
      sortOrder: 3,
    },
  });

  const catGauSeva = await prisma.donationCategory.create({
    data: {
      name: "Gau Seva & Nandishala",
      nameHi: "गौ सेवा एवं नंदीशाला संवर्धन",
      code: "GAU_SEVA",
      description: "Care, green fodder, medical treatment, and shelter for indigenous Desi Gir cows and bulls.",
      descriptionHi: "देसी गिर गायों एवं नंदी के संरक्षण, पौष्टिक हरा चारा, चिकित्सा एवं आश्रय व्यवस्था।",
      icon: "Heart",
      isTaxExempt: true,
      minAmount: 101,
      sortOrder: 4,
    },
  });

  const catVeda = await prisma.donationCategory.create({
    data: {
      name: "Veda Pathshala & Sanskrit Vidya",
      nameHi: "वेद पाठशाला एवं संस्कृत शिक्षा",
      code: "VEDA_PATHSHALA",
      description: "Gurukul education, Vedic chanting preservation, books, and boarding for young Brahmacharis.",
      descriptionHi: "गुरुकुल पद्धति से वेद-वेदांग अध्ययनरत बटुकों हेतु निःशुल्क आवास, वस्त्र, भोजन एवं ग्रंथ।",
      icon: "BookOpen",
      isTaxExempt: true,
      minAmount: 501,
      sortOrder: 5,
    },
  });

  console.log("✓ Donation categories initialized.");

  // 5. SAMPLE DONATIONS & FINANCIAL TRANSACTIONS
  const d1 = await prisma.donation.create({
    data: {
      receiptNumber: "DON-2026-00101",
      devoteeId: devotee1.id,
      donorName: "Amitabh R. Srivastava",
      donorEmail: "devotee@example.com",
      donorPhone: "+91 98111 22334",
      donorAddress: "Lucknow, Uttar Pradesh",
      donorPan: "ABCDE1234F",
      gotra: "Kashyapa",
      categoryId: catAnnadan.id,
      amount: 5100,
      paymentMethod: "ONLINE",
      paymentStatus: "SUCCESS",
      paymentGatewayRef: "pay_rzp_mock_00192837",
      transactionId: "TXN-DON-99201",
      isTaxExempt80G: true,
      tax80GNumber: "CIT(E)/AYODHYA/80G/2024/AABTS1234F",
      notes: "Sankalpa on family anniversary for 100 devotee meals",
    },
  });

  const d2 = await prisma.donation.create({
    data: {
      receiptNumber: "DON-2026-00102",
      donorName: "Smt. Sunita Devi Agarwal",
      donorEmail: "sunita.agarwal@gmail.com",
      donorPhone: "+91 94150 88291",
      donorAddress: "Kanpur, UP",
      categoryId: catGauSeva.id,
      amount: 2100,
      paymentMethod: "UPI",
      paymentStatus: "SUCCESS",
      paymentGatewayRef: "upi_ref_449201882",
      transactionId: "TXN-DON-99202",
      isTaxExempt80G: false,
    },
  });

  const d3 = await prisma.donation.create({
    data: {
      receiptNumber: "DON-2026-00103",
      donorName: "Anonymous Devotee (गुमनाम भक्त)",
      donorPhone: "+91 99999 00000",
      isAnonymous: true,
      categoryId: catRenovation.id,
      amount: 11000,
      paymentMethod: "CASH",
      paymentStatus: "SUCCESS",
      transactionId: "TXN-CASH-00441",
      notes: "Offline donation received at Temple Counter No. 1",
      createdByUserId: donationManager.id,
    },
  });

  await prisma.financialTransaction.createMany({
    data: [
      {
        transactionNumber: "FT-2026-INC-001",
        type: "INCOME",
        source: "DONATION",
        amount: 5100,
        paymentMethod: "ONLINE",
        referenceId: d1.id,
        referenceType: "Donation",
        description: "Annadan Mahaprasad Seva Donation by Amitabh R. Srivastava",
        status: "COMPLETED",
      },
      {
        transactionNumber: "FT-2026-INC-002",
        type: "INCOME",
        source: "DONATION",
        amount: 2100,
        paymentMethod: "UPI",
        referenceId: d2.id,
        referenceType: "Donation",
        description: "Gau Seva Donation by Smt. Sunita Devi Agarwal",
        status: "COMPLETED",
      },
      {
        transactionNumber: "FT-2026-INC-003",
        type: "INCOME",
        source: "DONATION",
        amount: 11000,
        paymentMethod: "CASH",
        referenceId: d3.id,
        referenceType: "Donation",
        description: "Temple Development Fund Cash Donation at Counter",
        status: "COMPLETED",
        recordedByUserId: donationManager.id,
      },
    ],
  });

  // 6. PRASAD & STORE PRODUCT CATEGORIES
  const pCatPrasad = await prisma.productCategory.create({
    data: {
      name: "Fresh Temple Prasad",
      nameHi: "पवित्र ताज़ा महाप्रसाद",
      slug: "fresh-prasad",
      description: "Directly consecrated bhog prepared with pure cow ghee and traditional recipes.",
      image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
      sortOrder: 1,
    },
  });

  const pCatSamagri = await prisma.productCategory.create({
    data: {
      name: "Puja Samagri & Havan Items",
      nameHi: "पूजा सामग्री एवं हवन द्रव्य",
      slug: "puja-samagri",
      description: "Pure camphor, desi cow ghee wicks, authentic saffron, gangajal and fragrant dhoop.",
      image: "https://images.unsplash.com/photo-1609829285741-6110f0f37311?w=800&auto=format&fit=crop&q=80",
      sortOrder: 2,
    },
  });

  const pCatBooks = await prisma.productCategory.create({
    data: {
      name: "Sacred Texts & Devotional Books",
      nameHi: "धार्मिक ग्रंथ एवं साहित्य",
      slug: "devotional-books",
      description: "Authentic scriptures, Ramcharitmanas, Gita, Stotra collections and Chalisa booklets.",
      image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
      sortOrder: 3,
    },
  });

  const pCatDevotional = await prisma.productCategory.create({
    data: {
      name: "Spiritual Artifacts & Idols",
      nameHi: "आध्यात्मिक विग्रह एवं यंत्र",
      slug: "spiritual-artifacts",
      description: "Panchadhatu murtis, energized Shri Yantras, brass diyas, and authentic Rudraksha malas.",
      image: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&auto=format&fit=crop&q=80",
      sortOrder: 4,
    },
  });

  // 7. PRODUCTS (PRASAD & STORE)
  const prod1 = await prisma.product.create({
    data: {
      categoryId: pCatPrasad.id,
      name: "Shri Ram Lalla Panchamrit Peda Box (500g)",
      nameHi: "श्री राम लला पंचामृत पेड़ा (500 ग्राम)",
      slug: "shri-ram-lalla-panchamrit-peda-500g",
      description: "Consecrated dry fruit and pure mawa peda prepared in the divine temple kitchen with tulsi leaves. Rich, hygienic, and long-lasting.",
      descriptionHi: "मंदिर पाकशाला में शुद्ध मावा, केसर, इलायची एवं तुलसी दल से निर्मित अभिमंत्रित पवित्र पेड़ा।",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
        "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80"
      ]),
      price: 350,
      salePrice: 320,
      sku: "PRASAD-PEDA-500G",
      stockQuantity: 120,
      minStockThreshold: 15,
      isPrasad: true,
      shelfLifeDays: 21,
      isFeatured: true,
      weightGrams: 500,
    },
  });

  const prod2 = await prisma.product.create({
    data: {
      categoryId: pCatPrasad.id,
      name: "Shuddh Desi Ghee Besan Mahaprasad Ladoo (1kg)",
      nameHi: "शुद्ध देशी घी बेसन महाप्रसाद लड्डू (1 किग्रा)",
      slug: "shuddh-desi-ghee-besan-ladoo-1kg",
      description: "Traditional roasted gram flour ladoos prepared strictly in 100% pure cow ghee with crunchy melon seeds, cashews, and aromatic cardamom.",
      descriptionHi: "100% शुद्ध गोघृत, मगज, काजू एवं हरी इलायची युक्त पारंपरिक बेसन लड्डू।",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=800&auto=format&fit=crop&q=80"
      ]),
      price: 650,
      salePrice: 590,
      sku: "PRASAD-LADOO-1KG",
      stockQuantity: 85,
      minStockThreshold: 10,
      isPrasad: true,
      shelfLifeDays: 30,
      isFeatured: true,
      weightGrams: 1000,
    },
  });

  const prod3 = await prisma.product.create({
    data: {
      categoryId: pCatSamagri.id,
      name: "Bhimseni Pure Camphor & Desi Cow Ghee Diya Pack",
      nameHi: "भीमसेनी शुद्ध कपूर एवं गोघृत बत्ती सेट",
      slug: "bhimseni-camphor-cow-ghee-diya-pack",
      description: "100% chemical-free organic edible-grade Bhimseni Kapoor along with 51 hand-dipped cow ghee wicks for daily auspicious morning & evening aarti.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1609829285741-6110f0f37311?w=800&auto=format&fit=crop&q=80"
      ]),
      price: 299,
      sku: "SAMAGRI-KAPOOR-GHEE",
      stockQuantity: 200,
      minStockThreshold: 25,
      isPrasad: false,
      isFeatured: false,
      weightGrams: 350,
    },
  });

  const prod4 = await prisma.product.create({
    data: {
      categoryId: pCatBooks.id,
      name: "Shrimad Ramcharitmanas Hardbound with Hindi Tika (Gita Press Edition)",
      nameHi: "सचित्र श्रीरामचरितमानस (विशिष्ट हार्डबाउंड संस्करण)",
      slug: "ramcharitmanas-hardbound-tika",
      description: "Complete 7 Kandas with authentic verse-by-verse Hindi translation, colorful sacred paintings, and ribbon bookmark. Perfect for daily family recitation.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80"
      ]),
      price: 495,
      sku: "BOOK-RAMCHARIT-01",
      stockQuantity: 60,
      minStockThreshold: 10,
      isPrasad: false,
      isFeatured: true,
      weightGrams: 1200,
    },
  });

  const prod5 = await prisma.product.create({
    data: {
      categoryId: pCatDevotional.id,
      name: "Panchadhatu Energized Shri Yantra (3x3 inch Solid Brass)",
      nameHi: "अभिमंत्रित पंचधातु श्री यंत्र",
      slug: "panchadhatu-energized-shri-yantra",
      description: "Consecrated during Chandi Homa rituals by Vedic scholars. Brings peace, positive cosmic energy, spiritual focus, and prosperity to homes.",
      images: JSON.stringify([
        "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&auto=format&fit=crop&q=80"
      ]),
      price: 1100,
      salePrice: 950,
      sku: "ARTIFACT-SHRI-YANTRA",
      stockQuantity: 40,
      minStockThreshold: 8,
      isPrasad: false,
      isFeatured: true,
      weightGrams: 450,
    },
  });

  // 8. SAMPLE ORDERS & ORDER ITEMS
  const order1 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-0081",
      devoteeId: devotee1.id,
      customerName: "Amitabh R. Srivastava",
      customerEmail: "devotee@example.com",
      customerPhone: "+91 98111 22334",
      deliveryType: "HOME_DELIVERY",
      shippingAddress: "B-42, Ayodhya Marg, Civil Lines",
      shippingCity: "Lucknow",
      shippingState: "Uttar Pradesh",
      shippingPincode: "226001",
      shippingCost: 80,
      subtotal: 910,
      discount: 0,
      totalAmount: 990,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      orderStatus: "PROCESSING",
      gatewayOrderId: "order_rzp_mock_001",
      gatewayPaymentId: "pay_rzp_mock_001",
      trackingNumber: "DTDC-UP-9821038",
      notes: "Please deliver before Friday afternoon.",
      orderItems: {
        create: [
          {
            productId: prod1.id,
            productName: prod1.name,
            price: 320,
            quantity: 1,
            totalAmount: 320,
          },
          {
            productId: prod2.id,
            productName: prod2.name,
            price: 590,
            quantity: 1,
            totalAmount: 590,
          },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      orderNumber: "ORD-2026-0082",
      customerName: "Vikram Singhania",
      customerEmail: "vikram.s@outlook.com",
      customerPhone: "+91 97200 11928",
      deliveryType: "PICKUP",
      shippingCost: 0,
      subtotal: 950,
      discount: 0,
      totalAmount: 950,
      paymentMethod: "ONLINE",
      paymentStatus: "PAID",
      orderStatus: "READY_FOR_PICKUP",
      notes: "Will collect after evening Sandhya Aarti.",
      orderItems: {
        create: [
          {
            productId: prod5.id,
            productName: prod5.name,
            price: 950,
            quantity: 1,
            totalAmount: 950,
          },
        ],
      },
    },
  });

  // 9. SUPPLIERS & INVENTORY MANAGEMENT
  const supGhee = await prisma.supplier.create({
    data: {
      name: "Gau Tirtha Organic Desi Ghee Gaushala",
      contactPerson: "Ramcharan Yadav",
      email: "orders@gautirtha.in",
      phone: "+91 94155 77112",
      address: "Village Nandgaon, Mathura Highway, UP",
      gstin: "09AAACG1234F1Z8",
      notes: "A2 Vedic Bilona Ghee supplier for Mandir Bhandar & Akhand Diya",
    },
  });

  const supPackaging = await prisma.supplier.create({
    data: {
      name: "Mangalam Eco-Friendly Boxes & Bags Ltd",
      contactPerson: "Dhiren Choksi",
      email: "dhiren@mangalamprint.com",
      phone: "+91 98250 44331",
      address: "Industrial Area, Phase 2, Varanasi",
      gstin: "09AACMP8872D1ZP",
    },
  });

  const inv1 = await prisma.inventoryItem.create({
    data: {
      name: "Pure A2 Gir Cow Ghee (Tins)",
      category: "PRASAD_RAW_MATERIAL",
      sku: "RAW-GHEE-15KG",
      unit: "tins (15kg)",
      currentStock: 48,
      minStockAlert: 10,
      unitCost: 11500,
      supplierId: supGhee.id,
      location: "Main Bhandar Store - Room 102",
    },
  });

  const inv2 = await prisma.inventoryItem.create({
    data: {
      name: "Kashmiri Mongra Saffron (Kesar)",
      category: "PUJA_SAMAGRI",
      sku: "RAW-KESAR-100G",
      unit: "boxes (100g)",
      currentStock: 22,
      minStockAlert: 5,
      unitCost: 18500,
      location: "Sanctum Strongroom Cupboard A",
    },
  });

  const inv3 = await prisma.inventoryItem.create({
    data: {
      name: "Gold-Embossed Prasad Packaging Boxes",
      category: "STORE_MERCHANDISE",
      sku: "PKG-BOX-500G",
      unit: "boxes",
      currentStock: 1450,
      minStockAlert: 300,
      unitCost: 14.5,
      supplierId: supPackaging.id,
      location: "Prasad Packing Section",
    },
  });

  // 10. EXPENSE CATEGORIES & EXPENSES
  const expCatRaw = await prisma.expenseCategory.create({
    data: {
      name: "Bhandar Ingredients & Prasad Raw Materials",
      code: "BHANDAR_RAW",
      description: "Ghee, milk, dry fruits, grains, flour, sugar, and spices for temple kitchen.",
    },
  });

  const expCatMaint = await prisma.expenseCategory.create({
    data: {
      name: "Temple Maintenance & Sanctum Lighting",
      code: "TEMPLE_MAINT",
      description: "Electricity, generator fuel, marble polishing, and security camera upkeep.",
    },
  });

  const expCatPriest = await prisma.expenseCategory.create({
    data: {
      name: "Pujari & Sevadar Stipends",
      code: "STAFF_STIPEND",
      description: "Monthly dakshina and honorarium for priests, vedic chanters, and cleaning staff.",
    },
  });

  await prisma.expense.create({
    data: {
      voucherNumber: "VCH-2026-0042",
      categoryId: expCatRaw.id,
      title: "Procurement of 10 Tins Pure A2 Cow Ghee for Mahaprasad",
      amount: 115000,
      paymentMethod: "BANK_TRANSFER",
      paymentStatus: "PAID",
      supplierId: supGhee.id,
      paidTo: "Gau Tirtha Organic Desi Ghee Gaushala",
      invoiceRef: "INV-GT-8819",
      notes: "Approved for upcoming Ram Navami preparation",
      approvedByUserId: superAdmin.id,
      recordedByUserId: accountant.id,
    },
  });

  await prisma.financialTransaction.create({
    data: {
      transactionNumber: "FT-2026-EXP-001",
      type: "EXPENSE",
      source: "VENDOR_PAYMENT",
      amount: 115000,
      paymentMethod: "BANK_TRANSFER",
      description: "Procurement of 10 Tins Pure A2 Cow Ghee for Mahaprasad",
      status: "COMPLETED",
      recordedByUserId: accountant.id,
    },
  });

  // 11. SEVA CATEGORIES & SEVAS
  const sevaCatDaily = await prisma.sevaCategory.create({
    data: {
      name: "Daily Nitya Seva & Abhishek",
      nameHi: "नित्य दैनिक सेवा एवं अभिषेक",
      description: "Sacred daily bathing and archana rituals performed with Vedic mantras.",
      sortOrder: 1,
    },
  });

  const sevaCatSpecial = await prisma.sevaCategory.create({
    data: {
      name: "Special Homa & Vedic Pujas",
      nameHi: "विशिष्ट हवन एवं अनुष्ठान",
      description: "Elaborate yajnas for planetary peace, health, prosperity, and family well-being.",
      sortOrder: 2,
    },
  });

  const sevaCatDarshan = await prisma.sevaCategory.create({
    data: {
      name: "Special Darshan & Aarti Sankalpa",
      nameHi: "विशिष्ट दर्शन एवं आरती संकल्प",
      description: "Reserved sanctum entry for major aartis with priest blessings and dry fruit bhog.",
      sortOrder: 3,
    },
  });

  const seva1 = await prisma.seva.create({
    data: {
      categoryId: sevaCatDaily.id,
      name: "Maharudrabhishek with Panchamrit & 1008 Bilva Patra",
      nameHi: "महारुद्राभिषेक (पंचामृत एवं 1008 बिल्व पत्र)",
      code: "SEVA-RUDRABHISHEK",
      description: "Traditional sacred bathing of Shiva Lingam with milk, curd, honey, sugarcane juice, and holy Gangajal while 11 Vedic priests chant Namakam & Chamakam.",
      descriptionHi: "11 वैदिक आचार्यों द्वारा श्रीरुद्रपाठ सहित पवित्र पंचामृत एवं बिल्व पत्र से भव्य अभिषेक।",
      deityName: "Lord Mahadev / Shiva Lingam",
      price: 2500,
      durationMinutes: 75,
      maxBookingsPerDay: 4,
      timings: "07:00 AM, 09:30 AM",
      includesPrasad: true,
      isFeatured: true,
      sortOrder: 1,
    },
  });

  const seva2 = await prisma.seva.create({
    data: {
      categoryId: sevaCatDaily.id,
      name: "Shri Ram Rajyabhishek & Sahasranama Archana",
      nameHi: "श्री राम राज्याभिषेक एवं सहस्रनाम अर्चना",
      code: "SEVA-RAM-ARCHANA",
      description: "Divine floral archana with 1,008 sacred names of Bhagwan Shri Ramachandra with family sankalpa and consecrated silver coin prasad.",
      descriptionHi: "भगवान श्री राम के 1,008 नामों से पुष्पार्चन, कुल संकल्प एवं अभिमंत्रित चांदी का सिक्का प्रसाद।",
      deityName: "Bhagwan Shri Ram Lalla",
      price: 1500,
      durationMinutes: 45,
      maxBookingsPerDay: 8,
      timings: "08:00 AM, 11:00 AM, 04:30 PM",
      includesPrasad: true,
      isFeatured: true,
      sortOrder: 2,
    },
  });

  const seva3 = await prisma.seva.create({
    data: {
      categoryId: sevaCatSpecial.id,
      name: "Chandi Homa & Navagraha Shanti Maha Yajna",
      nameHi: "चंडी होम एवं नवग्रह शांति महायज्ञ",
      code: "SEVA-CHANDI-HOMA",
      description: "Powerful fire ceremony to remove negative energies, bestow spiritual protection, and bring prosperity to the household.",
      descriptionHi: "सकल दोष निवारण, स्वास्थ्य, एवं सर्वांगीण उन्नति हेतु आहुति युक्त वैदिक महायज्ञ।",
      deityName: "Maa Durga & Navagraha Devatas",
      price: 5100,
      durationMinutes: 120,
      maxBookingsPerDay: 2,
      timings: "09:00 AM",
      includesPrasad: true,
      isFeatured: true,
      sortOrder: 3,
    },
  });

  const seva4 = await prisma.seva.create({
    data: {
      categoryId: sevaCatDarshan.id,
      name: "Special Mangala Aarti Darshan & Sankalpa",
      nameHi: "मंगला आरती विशिष्ट दर्शन एवं संकल्प",
      code: "SEVA-MANGALA-AARTI",
      description: "Witness the divine first awakening of the deity at dawn with special seat in the sanctum, priest stotra recitation, and fresh mawa bhog.",
      descriptionHi: "ब्राह्म मुहूर्त में प्रभु के प्रथम दर्शन, गर्भगृह आसन एवं विशिष्ट प्रसाद।",
      deityName: "Main Sanctum Deities",
      price: 501,
      durationMinutes: 30,
      maxBookingsPerDay: 20,
      timings: "05:00 AM",
      includesPrasad: true,
      isSpecialDarshan: true,
      isFeatured: false,
      sortOrder: 4,
    },
  });

  // 12. SAMPLE SEVA BOOKINGS
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await prisma.sevaBooking.create({
    data: {
      bookingNumber: "SB-2026-00341",
      sevaId: seva1.id,
      devoteeId: devotee1.id,
      devoteeName: "Amitabh R. Srivastava",
      devoteePhone: "+91 98111 22334",
      devoteeEmail: "devotee@example.com",
      gotra: "Kashyapa",
      nakshatra: "Rohini",
      rashi: "Vrishabha",
      sankalpa: "For peace, good health, and spiritual upliftment of the Srivastava family",
      familyMembers: "Amitabh, Vandana, Aryan",
      bookingDate: tomorrow,
      bookingTimeSlot: "07:00 AM",
      numberOfPeople: 3,
      totalAmount: 2500,
      paymentMethod: "ONLINE",
      paymentStatus: "CONFIRMED",
      bookingStatus: "CONFIRMED",
      specialInstructions: "Devotees will arrive in traditional dhoti/kurta and saree as per dress code.",
    },
  });

  // 13. FESTIVALS & EVENTS
  const ev1 = await prisma.event.create({
    data: {
      title: "Maha Shivratri Mahotsav 2026 (Char Pahar Akhand Puja)",
      titleHi: "महाशिवरात्रि महोत्सव 2026 (चार प्रहर अखंड पूजा)",
      slug: "maha-shivratri-mahotsav-2026",
      description: "Join the divine 24-hour celebration of Lord Shiva. Continuous Rudrabhishek throughout four quarters of the night, cultural bhajan sandhya by eminent vocalists, and distribution of cold thandai & fruit prasad.",
      descriptionHi: "भगवान देवाधिदेव महादेव का 24 घंटे चलने वाला भव्य अनुष्ठान। रात्रि चारों प्रहर में अखंड रुद्राभिषेक एवं भजन संध्या।",
      bannerImage: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&auto=format&fit=crop&q=80",
      startDate: new Date("2026-02-15T06:00:00Z"),
      endDate: new Date("2026-02-16T12:00:00Z"),
      location: "Main Mahadev Sanctum & Yajnashala",
      isRegistrationRequired: false,
      isPublished: true,
      isFeatured: true,
    },
  });

  const ev2 = await prisma.event.create({
    data: {
      title: "Shri Ram Navami Janmotsav & Grand Rath Yatra",
      titleHi: "श्री राम नवमी जन्मोत्सव एवं भव्य रथ यात्रा",
      slug: "shri-ram-navami-janmotsav-2026",
      description: "Celebrate the divine birth of Maryada Purushottam Bhagwan Shri Ram at 12:00 Noon with Sun rays consecration, 56 Bhog Mahaprasad, shower of flowers from air, and grand evening circumambulation.",
      descriptionHi: "दोपहर 12:00 बजे प्रभु श्रीराम का प्राकट्य उत्सव, 56 भोग, पुष्पवर्षा एवं नगर में भव्य रथयात्रा।",
      bannerImage: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=1200&auto=format&fit=crop&q=80",
      startDate: new Date("2026-03-27T08:00:00Z"),
      endDate: new Date("2026-03-28T22:00:00Z"),
      location: "Temple Complex & Ayodhya Heritage Path",
      isRegistrationRequired: true,
      maxAttendees: 5000,
      isPublished: true,
      isFeatured: true,
    },
  });

  const ev3 = await prisma.event.create({
    data: {
      title: "Kartik Purnima Grand Deepotsav & Saryu Maha Aarti",
      titleHi: "कार्तिक पूर्णिमा भव्य दीपोत्सव एवं महाआरती",
      slug: "kartik-purnima-deepotsav",
      description: "Illumination of 1,00,000 clay earthen lamps (diyas) across the temple premises, followed by grand Vedic chanting, classical music, and Ganga-Saryu Aarti.",
      descriptionHi: "मंदिर प्रांगण में 1 लाख दीपों का दिव्य प्रज्ज्वलन एवं संगीतमय महाआरती।",
      bannerImage: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80",
      startDate: new Date("2026-11-24T17:00:00Z"),
      endDate: new Date("2026-11-24T22:00:00Z"),
      location: "Temple Outer Courtyard & Ghats",
      isRegistrationRequired: false,
      isPublished: true,
      isFeatured: true,
    },
  });

  // 14. MULTIMEDIA GALLERY
  const alb1 = await prisma.galleryAlbum.create({
    data: {
      title: "Divine Sanctum & Daily Aarti Darshan",
      titleHi: "गर्भगृह एवं दैनिक आरती दर्शन",
      slug: "divine-sanctum-daily-aarti",
      description: "Glimpses of daily flower decorations, golden adornments, and serene sanctum atmosphere.",
      coverImage: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=800&auto=format&fit=crop&q=80",
      category: "DAILY_DARSHAN",
      isPublished: true,
      sortOrder: 1,
      mediaAssets: {
        create: [
          {
            title: "Morning Mangala Shringar",
            caption: "Deities adorned with fresh fragrant jasmine, tulsi, and pure silk pitambar",
            mediaType: "IMAGE",
            url: "https://images.unsplash.com/photo-1582560475093-ba66accbc424?w=1200&auto=format&fit=crop&q=80",
            sortOrder: 1,
            isFeatured: true,
          },
          {
            title: "Sandhya Deepa Aarti",
            caption: "Brass oil lamps illuminated as bells and conches resonate across the temple hall",
            mediaType: "IMAGE",
            url: "https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80",
            sortOrder: 2,
            isFeatured: true,
          },
        ],
      },
    },
  });

  const alb2 = await prisma.galleryAlbum.create({
    data: {
      title: "Annadan Mahaprasad Seva",
      titleHi: "अन्नदान महाप्रसाद सेवा",
      slug: "annadan-mahaprasad-seva",
      description: "Devotees and volunteers participating in the holy community feeding seva.",
      coverImage: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800&auto=format&fit=crop&q=80",
      category: "CHARITY",
      isPublished: true,
      sortOrder: 2,
      mediaAssets: {
        create: [
          {
            title: "Devotee Dining Hall (Bhojanalaya)",
            caption: "Serving thousands of seated pilgrims hot dal, rice, rotis, sabzi, and kheer with love",
            mediaType: "IMAGE",
            url: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=1200&auto=format&fit=crop&q=80",
            sortOrder: 1,
            isFeatured: true,
          },
        ],
      },
    },
  });

  // 15. ANNOUNCEMENTS & TICKER NOTICES
  await prisma.announcement.createMany({
    data: [
      {
        title: "Special Darshan Guidelines for Upcoming Ekadashi",
        titleHi: "आगामी एकादशी पर्व पर विशिष्ट दर्शन निर्देश",
        message: "Darshan lines will open at 04:30 AM. Senior citizens and divyangjan devotees have a dedicated queue through Gate No. 3.",
        messageHi: "एकादशी पर दर्शन प्रातः 04:30 बजे से प्रारंभ होंगे। वरिष्ठ नागरिकों हेतु द्वार संख्या 3 से विशेष व्यवस्था है।",
        type: "FESTIVAL_SPECIAL",
        isActive: true,
        isBanner: true,
        priority: 1,
      },
      {
        title: "Free Ayurvedic Health & Medical Camp Every Sunday",
        titleHi: "प्रत्येक रविवार निःशुल्क आयुर्वेदिक स्वास्थ्य शिविर",
        message: "Temple trust in association with Dhanvantari Ayurveda conducts free consultations and medicine distribution from 09:00 AM to 02:00 PM.",
        messageHi: "मंदिर ट्रस्ट द्वारा प्रत्येक रविवार निःशुल्क नाड़ी परीक्षण एवं औषधि वितरण किया जाता है।",
        type: "INFO",
        isActive: true,
        isBanner: false,
        priority: 2,
      },
    ],
  });

  // 16. SYSTEM CONFIGURATION & SETTINGS
  const settingsData = [
    { key: "TEMPLE_NAME", value: "Shri Ram Janmabhoomi & Mahadev Mandir", group: "GENERAL", description: "Official name of the temple" },
    { key: "TEMPLE_NAME_HI", value: "श्री राम जन्मभूमि एवं महादेव मंदिर", group: "GENERAL", description: "Hindi name of the temple" },
    { key: "TEMPLE_TRUST_NAME", value: "Shri Ram Mahadev Mandir Charitable Trust (Regd.)", group: "GENERAL", description: "Registered legal entity name" },
    { key: "TRUST_REG_NUMBER", value: "TRUST/UP/AYD/2020/00482", group: "GENERAL", description: "Trust registration number" },
    { key: "DARSHAN_TIMINGS", value: "05:00 AM - 12:30 PM, 04:00 PM - 09:30 PM", group: "DARSHAN", description: "General darshan visiting hours" },
    { key: "MANGALA_AARTI_TIME", value: "05:00 AM", group: "DARSHAN", description: "First morning aarti" },
    { key: "SHRINGAR_AARTI_TIME", value: "06:30 AM", group: "DARSHAN", description: "Deity shringar aarti" },
    { key: "BHOG_AARTI_TIME", value: "12:00 PM", group: "DARSHAN", description: "Afternoon bhog aarti" },
    { key: "SANDHYA_AARTI_TIME", value: "07:00 PM", group: "DARSHAN", description: "Evening deepa aarti" },
    { key: "SHAYAN_AARTI_TIME", value: "09:30 PM", group: "DARSHAN", description: "Night shayan aarti" },
    { key: "TEMPLE_ADDRESS", value: "Ramkot, Ayodhya Dham, Uttar Pradesh - 224123, India", group: "CONTACT", description: "Physical street address" },
    { key: "CONTACT_PHONE", value: "+91 5278 297 108", group: "CONTACT", description: "Primary inquiry phone line" },
    { key: "CONTACT_EMAIL", value: "sevadar@shrirammandirtrust.org", group: "CONTACT", description: "Official email" },
    { key: "CONTACT_WHATSAPP", value: "+91 98765 00000", group: "CONTACT", description: "Devotee assistance helpline" },
    { key: "ENABLE_80G_TAX_EXEMPTION", value: "true", group: "TAX", description: "Is 80G tax exemption active" },
    { key: "TAX_80G_REG_NUMBER", value: "CIT(E)/AYODHYA/80G/2024/AABTS1234F", group: "TAX", description: "Income Tax 80G Order Number" },
    { key: "STORE_DELIVERY_FEE", value: "80", group: "STORE", description: "Flat shipping fee for home delivery" },
    { key: "STORE_FREE_DELIVERY_THRESHOLD", value: "1500", group: "STORE", description: "Free shipping order amount" },
    { key: "PAYMENT_GATEWAY_PROVIDER", value: "RAZORPAY", group: "PAYMENTS", description: "Active payment provider" },
  ];

  for (const s of settingsData) {
    await prisma.templeSetting.create({ data: s });
  }

  // 17. INITIAL AUDIT LOG
  await prisma.auditLog.create({
    data: {
      userId: superAdmin.id,
      action: "SYSTEM_INITIALIZED",
      entity: "System",
      entityId: "SYS-INIT",
      details: JSON.stringify({ message: "Comprehensive temple database seeded with production data." }),
      ipAddress: "127.0.0.1",
      userAgent: "TMS Seed Script v1.0",
    },
  });

  console.log("✅ Database successfully seeded with authentic temple operations records!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
